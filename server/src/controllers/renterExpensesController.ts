import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class RenterExpensesController {
  static async updateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { lastPaymentDate, dueDate } = req.body;

      const updatedExpense = await prisma.renterExpenses.update({
        where: { id: +id },
        data: {
          lastPaymentDate: new Date(lastPaymentDate),
          dueDate: new Date(dueDate),
        },
      });

      res.json(updatedExpense);
    } catch (err) {
      next(err);
    }
  }
}
