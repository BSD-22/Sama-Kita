import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class OwnerExpensesController {
  static async createExpenseSetting(req: Request, res: Response) {
    try {
      const {
        propertyId,
        expenseCategory,
        amount,
        dueDay,
        description,
      } = req.body;

      const setting = await prisma.ownerExpenseSettings.create({
        data: {
          propertyId: parseInt(propertyId),
          expenseCategory,
          amount,
          dueDay,
          description,
        },
      });

      res.status(201).json(setting);
    } catch (error) {
      console.error('Error creating owner expense setting:', error);
      res.status(500).json({ error: 'Failed to create expense setting' });
    }
  }

  static async getExpenseSettings(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      const settings = await prisma.ownerExpenseSettings.findMany({
        where: { propertyId: parseInt(propertyId) },
        include: {
          expenses: {
            orderBy: { dueDate: 'desc' },
            take: 12, // Last 12 months
          },
        },
      });

      res.json(settings);
    } catch (error) {
      console.error('Error fetching owner expense settings:', error);
      res.status(500).json({ error: 'Failed to fetch expense settings' });
    }
  }

  static async updateExpenseSetting(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        expenseCategory,
        amount,
        dueDay,
        description,
      } = req.body;

      const setting = await prisma.ownerExpenseSettings.update({
        where: { id: parseInt(id) },
        data: {
          expenseCategory,
          amount,
          dueDay,
          description,
        },
      });

      res.json(setting);
    } catch (error) {
      console.error('Error updating owner expense setting:', error);
      res.status(500).json({ error: 'Failed to update expense setting' });
    }
  }

  static async deleteExpenseSetting(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.ownerExpenseSettings.delete({
        where: { id: parseInt(id) },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting owner expense setting:', error);
      res.status(500).json({ error: 'Failed to delete expense setting' });
    }
  }

  static async getOwnerExpenses(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { month, year } = req.query;

      const expenses = await prisma.ownerExpenses.findMany({
        where: {
          propertyId: parseInt(propertyId),
          month: month ? parseInt(month as string) : undefined,
          year: year ? parseInt(year as string) : undefined,
        },
        include: {
          setting: true,
        },
        orderBy: { dueDate: 'desc' },
      });

      res.json(expenses);
    } catch (error) {
      console.error('Error fetching owner expenses:', error);
      res.status(500).json({ error: 'Failed to fetch expenses' });
    }
  }

  static async updateExpenseStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const expense = await prisma.ownerExpenses.update({
        where: { id: parseInt(id) },
        data: {
          status,
          paidDate: status === 'COMPLETED' ? new Date() : null,
        },
      });

      res.json(expense);
    } catch (error) {
      console.error('Error updating owner expense status:', error);
      res.status(500).json({ error: 'Failed to update expense status' });
    }
  }

  // This method should be called by a scheduled job to create monthly expenses
  static async generateMonthlyExpenses(propertyId: number, month: number, year: number) {
    try {
      const settings = await prisma.ownerExpenseSettings.findMany({
        where: { propertyId },
      });

      const expenses = [];
      for (const setting of settings) {
        const dueDate = new Date(year, month - 1, setting.dueDay);
        
        const expense = await prisma.ownerExpenses.create({
          data: {
            settingId: setting.id,
            propertyId,
            amount: setting.amount,
            dueDate,
            description: setting.description,
            month,
            year,
            status: 'PENDING',
          },
        });
        
        expenses.push(expense);
      }

      return expenses;
    } catch (error) {
      console.error('Error generating monthly expenses:', error);
      throw error;
    }
  }
}

export default OwnerExpensesController;
