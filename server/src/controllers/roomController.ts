import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

import { imagekit } from '../helpers/imagekit';

const prisma = new PrismaClient();

class RoomController {
  static async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await prisma.room.findMany({
        include: {
          property: true,
          individualRooms: {
            include: {
              renters: {
                where: {
                  hasLeaved: false, // Only include active renters
                },
              },
            },
          },
        },
      });

      // Transform the data to include availability info
      const transformedRooms = rooms.map((room) => ({
        ...room,
        availableRooms: room.individualRooms.filter((ir) => ir.renters.length === 0).length,
        totalRooms: room.individualRooms.length,
        occupiedRooms: room.individualRooms.filter((ir) => ir.renters.length > 0).length,
      }));

      res.json(transformedRooms);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const room = await prisma.room.findUnique({
        where: { id: Number(id) },
        include: {
          property: true,
          individualRooms: true,
        },
      });
      if (!room) throw { name: 'NotFound' };
      res.json(room);
    } catch (error) {
      next(error);
    }
  }

  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { typeName, price, Area, totalRooms, propertyId } = req.body;
      const roomImage = req.file;

      let imageUrl = null;
      if (roomImage) {
        // Upload to ImageKit
        const upload = await imagekit.upload({
          file: roomImage.buffer,
          fileName: `room-${Date.now()}-${roomImage.originalname}`,
          folder: '/rooms', // Optional: organize in folders
        });
        imageUrl = upload.url;
      }

      const room = await prisma.room.create({
        data: {
          typeName,
          price: Number(price),
          Area: Number(Area),
          totalRooms: Number(totalRooms),
          propertyId: Number(propertyId),
          roomImage: imageUrl,
          individualRooms: {
            create: Array.from({ length: Number(totalRooms) }, (_, index) => ({
              roomNumber: `${typeName}-${index + 1}`,
              status: 'Available',
            })),
          },
        },
        include: {
          property: true,
          individualRooms: true,
        },
      });

      res.status(201).json(room);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomsByPropertyId(req: Request<{ propertyId: string }>, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;

      const rooms = await prisma.room.findMany({
        where: {
          propertyId: Number(propertyId),
        },
        include: {
          property: true,
          individualRooms: true,
        },
      });

      res.json(rooms);
    } catch (error) {
      next(error);
    }
  }

  static async getIndividualRoomsByRoomId(req: Request<{ roomId: string }>, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;

      const individualRooms = await prisma.individualRoom.findMany({
        where: {
          roomId: Number(roomId),
          status: 'Available', // Only get available rooms
        },
        orderBy: {
          roomNumber: 'asc',
        },
      });

      res.json(individualRooms);
    } catch (error) {
      next(error);
    }
  }

  static async getProperties(req: Request, res: Response, next: NextFunction) {
    const userId = req.loginInfo?.userId;
    try {
      const properties = await prisma.property.findMany({
        where: {
          userId: Number(userId),
        },
        select: {
          id: true,
          propertyName: true,
        },
      });
      res.json(properties);
    } catch (error) {
      next(error);
    }
  }
}

export default RoomController;
