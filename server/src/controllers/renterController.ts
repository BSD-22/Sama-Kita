import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

import { imagekit } from '../helpers/imagekit';
import { checkAndUpdatePaymentStatus } from '../utils/paymentUtils';

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
  maintenanceCategory: string;
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
          RenterExpenses: {
            orderBy: {
              serviceDate: 'desc',
            },
          },
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

  static async getRenterById(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.loginInfo?.userId;

      if (!userId) throw { name: 'AuthenticationError' };

      const renter = await prisma.renter.findUnique({
        where: { id: +id },
        include: {
          property: true,
          room: true,
          individualRoom: true,
          RenterTransaction: {
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
          },
        },
      });

      if (!renter) throw { name: 'NotFoundError' };
      if (renter.userId !== userId) throw { name: 'AuthorizationError' };

      // Check and update payment status
      await checkAndUpdatePaymentStatus(+id);

      // Fetch updated transactions
      const transactions = await prisma.renterTransaction.findMany({
        where: { renterId: +id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });

      res.status(200).json({
        ...renter,
        RenterTransaction: transactions,
      });
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
      console.log('Received request body:', req.body);
      console.log('Received file:', req.file);

      const {
        renterId,
        serviceDate,
        serviceDescription,
        maintenanceType,
        maintenanceCategory,
        servicePrice,
        lastPaymentDate,
      } = req.body;

      // Validate required fields
      if (
        !renterId ||
        !serviceDate ||
        !serviceDescription ||
        !maintenanceType ||
        !maintenanceCategory ||
        !servicePrice ||
        !lastPaymentDate
      ) {
        throw { name: 'ValidationError', message: 'All fields are required' };
      }

      if (!req.file) {
        throw { name: 'NoFileError', message: 'Service invoice file is required' };
      }

      // Convert file to base64
      const imgFile = req.file.buffer.toString('base64');

      try {
        const serviceInvoice = await imagekit.upload({
          file: imgFile,
          fileName: req.file?.originalname,
        });

        const renterExists = await prisma.renter.findUnique({
          where: { id: +renterId },
          include: { property: true },
        });

        if (!renterExists) {
          throw { name: 'NotFoundError', message: 'Renter not found' };
        }

        // Validate that the renter belongs to the specified property
        if (renterExists.propertyId !== +req.params.propertyId) {
          throw { name: 'ValidationError', message: 'Renter does not belong to the specified property' };
        }

        const renterexpense = await prisma.renterExpenses.create({
          data: {
            renterId: +renterId,
            serviceDate: new Date(serviceDate),
            serviceDescription,
            maintenanceType,
            maintenanceCategory,
            serviceInvoice: serviceInvoice.url,
            servicePrice: +servicePrice,
            lastPaymentDate: new Date(lastPaymentDate),
          },
        });

        console.log('Created renter expense:', renterexpense);
        res.status(201).json(renterexpense);
      } catch (uploadError) {
        console.error('Error during file upload or database operation:', uploadError);
        throw { name: 'UploadError', message: 'Failed to process file or save expense', details: uploadError };
      }
    } catch (err) {
      console.error('Error in addRentersExpenses:', err);
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
      const { transactionId } = req.body;
      const userId = req.loginInfo?.userId;

      if (!userId) throw { name: 'AuthenticationError' };

      // Get renter details
      const renter = await prisma.renter.findUnique({
        where: { id: +id },
        include: {
          room: true,
          property: true,
        },
      });

      if (!renter) throw { name: 'NotFoundError', message: 'Renter not found' };
      if (renter.hasLeaved) throw { name: 'ValidationError', message: 'Renter has already left' };

      // Update the transaction status
      const result = await prisma.renterTransaction.update({
        where: { id: transactionId },
        data: {
          paymentStatus: true,
          paidAt: new Date(),
          isOverdue: false,
        },
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async updateRenter(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.loginInfo?.userId;
      const updateData = req.body;

      if (!userId) throw { name: 'AuthenticationError' };

      // Find the renter first to verify ownership
      const existingRenter = await prisma.renter.findUnique({
        where: { id: +id },
      });

      if (!existingRenter) throw { name: 'NotFoundError' };
      if (existingRenter.userId !== userId) throw { name: 'AuthorizationError' };

      // Update the renter
      const updatedRenter = await prisma.renter.update({
        where: { id: +id },
        data: {
          renterName: updateData.renterName,
          renterEmail: updateData.renterEmail,
          renterPhone: updateData.renterPhone,
          ktpNumber: updateData.ktpNumber,
          depositAmount: updateData.depositAmount,
        },
        include: {
          property: true,
          room: true,
          individualRoom: true,
        },
      });

      res.status(200).json(updatedRenter);
    } catch (err) {
      next(err);
    }
  }

  static async completePayment(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { transactionId } = req.body;

      const transaction = await prisma.renterTransaction.update({
        where: { id: +transactionId },
        data: {
          paymentStatus: true,
          paidAt: new Date(),
          isOverdue: false,
        },
      });

      res.status(200).json(transaction);
    } catch (err) {
      next(err);
    }
  }

  static async getPendingPayments(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.loginInfo?.userId;

      if (!userId) throw { name: 'AuthenticationError' };

      // Get renter's pending transactions
      const pendingPayments = await prisma.renterTransaction.findMany({
        where: {
          renterId: +id,
          paymentStatus: false,
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: {
          renter: {
            select: {
              renterName: true,
              room: {
                select: {
                  typeName: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(pendingPayments);
    } catch (err) {
      next(err);
    }
  }
}
