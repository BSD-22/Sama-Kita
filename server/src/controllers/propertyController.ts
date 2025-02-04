import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { imagekit } from '../helpers/imagekit';

const prisma = new PrismaClient();

type RenterExpenses = {
  id: number;
  renterId: number;
  serviceDate: Date;
  serviceDescription: string;
  servicePrice: number;
  serviceInvoice: string;
  lastPaymentDate: Date;
  maintenanceType: string;
};

export default class propertyController {
  static async getPropertyByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;
      const properties = await prisma.property.findMany({
        where: {
          userId,
        },
        include: {
          Room: true,
          Operator: true,
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
          Room: true,
          Renter: true,
        },
      });
      if (!property) throw { name: 'NotFoundError' };

      res.status(200).json(property);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async editRoomById(req: Request<{ propertyId: string; roomId: string }, unknown, { typeName: string; price: number; Area: number; totalRooms: number; existingRoomImage: string | null }>, res: Response, next: NextFunction) {
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

  static async getRoomsByProperty(req: Request<{ propertyId: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;

      const room = await prisma.room.findMany({
        where: {
          propertyId: +propertyId,
        },
        include: {
          Renter: {
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

  static async getRentersByProperty(req: Request<{ propertyId: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const renters = await prisma.renter.findMany({
        where: {
          userId: req.loginInfo?.userId,
        },
        include: {
          property: true,
          RenterExpenses: true,
          room: true,
          RenterTransaction: true,
        },
      });

      res.status(200).json(renters);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getRenterById(req: Request<{ id: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const renter = await prisma.renter.findUnique({
        where: {
          id: +id,
        },
        include: {
          RenterExpenses: true,
          room: true,
          RenterTransaction: true,
        },
      });
      if (!renter) throw { name: 'NotFoundError' };

      res.status(200).json(renter);
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
          Renter: {
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

  static async addRentersExpenses(req: Request<{ propertyId: string }, unknown, RenterExpenses>, res: Response, next: NextFunction) {
    try {
      const { renterId, serviceDate, serviceDescription, maintenanceType, servicePrice, lastPaymentDate } = req.body;

      if (!req.file) throw { name: 'NoFileError' };
      const imgFile = req.file.buffer.toString('base64');

      const serviceInvoice = await imagekit
        .upload({
          file: imgFile,
          fileName: req.file?.originalname,
        })
        .catch((err) => {
          throw { name: 'UploadError', message: 'Failed to upload file', details: err };
        });

      const renterExists = await prisma.renter.findUnique({ where: { id: +renterId } });
      if (!renterExists) {
        throw { name: 'NotFoundError' };
      }

      const renterexpense = await prisma.renterExpenses.create({
        data: {
          renterId: +renterId,
          serviceDate: new Date(serviceDate),
          serviceDescription,
          maintenanceType,
          serviceInvoice: serviceInvoice.url,
          servicePrice: +servicePrice,
          lastPaymentDate: new Date(lastPaymentDate),
        },
      });

      res.status(200).json(renterexpense);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async addRoomByPropertyId(req: Request<{ propertyId: string }, unknown, { typeName: string; price: number; Area: number; totalRooms: number; roomImage: string }>, res: Response, next: NextFunction) {
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

      const room = await prisma.room.create({ data: { typeName, price: +price, Area: +Area, propertyId: +propertyId, totalRooms: +totalRooms, roomImage: roomImage.url } });

      res.status(200).json(room);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getOcuppancies(req: Request<{ propertyId: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const properties = await prisma.property.findMany({
        where: {
          userId: req.loginInfo?.userId,
        },
        include: {
          Room: true,
          Renter: true,
        },
      });
      if (!properties) throw { name: 'NotFoundError' };

      const occupancies = properties.map((property) => {
        let totalRooms = 0;
        const occupiedRooms = property.Renter.length;

        property.Room.forEach((room) => {
          totalRooms += room.totalRooms; // Total rooms in this property
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

  static async deleteRenterById(req: Request<{ id: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // renterId

      const renter = await prisma.renter.delete({
        where: {
          id: +id,
        },
      });

      res.status(200).json(renter);
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
          Room: true,
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
}
