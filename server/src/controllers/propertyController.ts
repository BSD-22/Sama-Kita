import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

import { imagekit } from '../helpers/imagekit';

const prisma = new PrismaClient();

export default class propertyController {
  static async getPropertyByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;
      const properties = await prisma.property.findMany({
        where: {
          userId,
        },
        include: {
          Room: {
            select: {
              id: true,
              typeName: true,
              totalRooms: true,
            },
          },
          Operator: {
            select: {
              id: true,
              operatorName: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });

      if (!properties) throw { name: 'NotFoundError' };

      res.status(200).json(properties);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getPropertyById(req: Request<{ id: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const property = await prisma.property.findUnique({
        where: {
          id: +id,
        },
        include: {
          Room: {
            include: {
              individualRooms: {
                include: {
                  renters: {
                    where: {
                      hasLeaved: false,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!property) throw { name: 'NotFoundError' };

      // Transform the data to include room availability info
      const transformedProperty = {
        ...property,
        Room: property.Room.map((room) => ({
          ...room,
          availableRooms: room.individualRooms.filter((ir) => ir.status === 'Available').length,
          occupiedRooms: room.individualRooms.filter((ir) => ir.status === 'Rented').length,
        })),
      };

      res.status(200).json(transformedProperty);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async editRoomById(
    req: Request<
      { propertyId: string; roomId: string },
      unknown,
      { typeName: string; price: number; Area: number; totalRooms: number; existingRoomImage: string | null }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { propertyId, roomId } = req.params;
      const { typeName, price, Area, totalRooms } = req.body;

      // Check if file is uploaded
      let roomImageUrl: string | null = null;

      if (req.file) {
        // If a new file is uploaded, upload to ImageKit
        const imgFile = req.file.buffer.toString('base64');

        const uploadedImage = await imagekit
          .upload({
            file: imgFile,
            fileName: req.file.originalname,
          })
          .catch((err) => {
            throw { name: 'UploadError', message: 'Failed to upload file', details: err };
          });

        roomImageUrl = uploadedImage.url;
      } else {
        roomImageUrl = req.body.existingRoomImage || null;
      }

      const room = await prisma.room.update({
        where: {
          id: +roomId,
        },
        data: {
          typeName,
          price: +price,
          Area: +Area,
          totalRooms: +totalRooms,
          roomImage: roomImageUrl, // Either new image or existing image URL
          propertyId: +propertyId,
        },
      });

      res.status(200).json(room);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }

  static async getRoomsByProperty(
    req: Request<{ propertyId: string }, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { propertyId } = req.params;

      const room = await prisma.room.findMany({
        where: {
          propertyId: +propertyId,
        },
        include: {
          renters: {
            include: {
              RenterExpenses: true,
            },
          },
        },
      });
      if (!room) throw { name: 'NotFoundError' };

      res.status(200).json(room);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getRoomById(req: Request<{ roomId: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const room = await prisma.room.findUnique({
        where: {
          id: +roomId,
        },
        include: {
          renters: {
            include: {
              RenterExpenses: true,
            },
          },
        },
      });
      if (!room) throw { name: 'NotFoundError' };

      res.status(200).json(room);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async addRoomByPropertyId(
    req: Request<
      { propertyId: string },
      unknown,
      { typeName: string; price: number; Area: number; totalRooms: number; roomImage: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { propertyId } = req.params;
      const { typeName, price, Area, totalRooms } = req.body;

      if (!req.file) throw { name: 'NoFileError' };
      const imgFile = req.file.buffer.toString('base64');

      const roomImage = await imagekit
        .upload({
          file: imgFile,
          fileName: req.file?.originalname,
        })
        .catch((err) => {
          throw { name: 'UploadError', message: 'Failed to upload file', details: err };
        });

      const result = await prisma.$transaction(async (tx) => {
        // Create the room type
        const room = await tx.room.create({
          data: {
            typeName,
            price: +price,
            Area: +Area,
            propertyId: +propertyId,
            totalRooms: +totalRooms,
            roomImage: roomImage.url,
          },
        });

        // Create individual rooms
        const individualRooms = await Promise.all(
          Array.from({ length: totalRooms }, (_, i) => {
            return tx.individualRoom.create({
              data: {
                roomNumber: `${typeName}-${i + 1}`,
                roomId: room.id,
              },
            });
          }),
        );

        return { ...room, individualRooms };
      });

      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getOcuppancies(
    req: Request<{ propertyId: string }, unknown, unknown>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const properties = await prisma.property.findMany({
        where: {
          userId: req.loginInfo?.userId,
        },
        include: {
          Room: {
            include: {
              individualRooms: true,
            },
          },
        },
      });
      if (!properties) throw { name: 'NotFoundError' };

      const occupancies = properties.map((property) => {
        let totalRooms = 0;
        let occupiedRooms = 0;

        property.Room.forEach((room) => {
          totalRooms += room.individualRooms.length;
          occupiedRooms += room.individualRooms.filter((ir) => ir.status === 'Rented').length;
        });

        return {
          propertyId: property.id,
          propertyName: property.propertyName,
          totalRooms,
          occupiedRooms,
        };
      });

      res.status(200).json(occupancies);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getAllData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;
      const allData = await prisma.property.findMany({
        where: {
          userId: +userId!,
        },
        include: {
          Room: {
            include: {
              individualRooms: true,
              renters: {
                include: {
                  RenterExpenses: true,
                  RenterTransaction: true,
                },
              },
            },
          },
          Operator: true,
          Renter: {
            include: {
              RenterExpenses: true,
              RenterTransaction: true,
            },
          },
        },
      });

      res.status(200).json(allData);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async addProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyName, dueDate } = req.body;
      const userId = req.loginInfo?.userId;

      if (!userId) {
        throw { name: 'AuthenticationError', message: 'User not authenticated' };
      }

      if (!propertyName || !dueDate) {
        throw { name: 'ValidationError', message: 'Property name and due date are required' };
      }

      // Handle image upload
      if (!req.file) {
        throw { name: 'ValidationError', message: 'Property image is required' };
      }

      const imgFile = req.file.buffer.toString('base64');

      const uploadedImage = await imagekit.upload({
        file: imgFile,
        fileName: req.file.originalname,
      });

      const propertyImageUrl = uploadedImage.url;

      const property = await prisma.property.create({
        data: {
          propertyName,
          dueDate: Number(dueDate),
          propertyImage: propertyImageUrl,
          userId,
        },
        include: {
          Room: true,
          Operator: true,
        },
      });

      res.status(201).json({
        message: 'Property created successfully',
        data: property,
      });
    } catch (error) {
      console.error('Error in addProperty:', error);
      next(error);
    }
  }
}
