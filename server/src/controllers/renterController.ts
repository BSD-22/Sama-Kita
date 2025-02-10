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

export default class renterController {
  static async getRentersByUser(req: Request<unknown, unknown, unknown>, res: Response, next: NextFunction) {
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
          individualRoom: true,
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

  static async addRentersExpenses(
    req: Request<{ propertyId: string }, unknown, RenterExpenses>,
    res: Response,
    next: NextFunction,
  ) {
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

  static async deleteRenterById(req: Request<{ id: string }, unknown, unknown>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const renter = await prisma.renter.findUnique({
        where: { id: +id },
        include: {
          individualRoom: true,
        },
      });

      if (!renter) throw { name: 'NotFoundError' };

      const result = await prisma.$transaction(async (tx) => {
        await tx.individualRoom.update({
          where: { id: renter.individualRoomId },
          data: { status: 'Available' },
        });

        const deletedRenter = await tx.renter.delete({
          where: { id: +id },
        });

        return deletedRenter;
      });

      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async createRenter(req: Request, res: Response, next: NextFunction) {
    try {
      const renterData = req.body;
      const userId = req.loginInfo?.userId;

      if (!userId) throw { name: 'AuthenticationError' };

      // Add userId to renterData
      const dataWithUser = {
        ...renterData,
        userId: Number(userId),
        // Convert string dates to Date objects
        joinDate: new Date(renterData.joinDate),
        leaveDate: new Date(renterData.leaveDate),
        // Ensure numeric fields are numbers
        depositAmount: Number(renterData.depositAmount),
        propertyId: Number(renterData.propertyId),
        roomId: Number(renterData.roomId),
        individualRoomId: Number(renterData.individualRoomId),
      };

      // Create renter and update room status in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the renter
        const renter = await tx.renter.create({
          data: dataWithUser,
          include: {
            property: true,
            individualRoom: true,
          },
        });

        // Update individual room status to Rented
        await tx.individualRoom.update({
          where: {
            id: Number(renterData.individualRoomId),
          },
          data: {
            status: 'Rented',
          },
        });

        return renter;
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async endRenterContract(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.loginInfo?.userId;

      if (!userId) throw { name: 'AuthenticationError' };

      // Get renter details
      const renter = await prisma.renter.findUnique({
        where: { id: +id },
        include: { room: true },
      });

      if (!renter) throw { name: 'NotFoundError', message: 'Renter not found' };
      if (renter.hasLeaved) throw { name: 'ValidationError', message: 'Renter has already left' };

      // Start a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update renter status
        const updatedRenter = await tx.renter.update({
          where: { id: +id },
          data: {
            hasLeaved: true,
            leaveDate: new Date(), // Set leave date to today
          },
        });

        // Update room status
        await tx.room.update({
          where: { id: renter.roomId },
          data: { status: 'Available' },
        });

        return updatedRenter;
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async completeManualPayment(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.loginInfo?.userId;

      if (!userId) throw { name: 'AuthenticationError' };

      // Get renter details
      const renter = await prisma.renter.findUnique({
        where: { id: +id },
        include: {
          room: true,
          RenterTransaction: {
            where: {
              paymentStatus: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!renter) throw { name: 'NotFoundError', message: 'Renter not found' };
      if (renter.hasLeaved) throw { name: 'ValidationError', message: 'Renter has already left' };

      // If there's a pending transaction, mark it as paid
      if (renter.RenterTransaction.length > 0) {
        const transaction = renter.RenterTransaction[0];
        await prisma.renterTransaction.update({
          where: { id: transaction.id },
          data: { paymentStatus: true },
        });
      }

      // Create a new transaction record for the manual payment
      const result = await prisma.renterTransaction.create({
        data: {
          renterId: +id,
          orderId: `MANUAL-${Date.now()}`,
          paymentStatus: true,
          amount: renter.room.price,
        },
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
