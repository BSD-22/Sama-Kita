import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UtilityKey = 'electricity' | 'water' | 'internet';
type UtilityField<T extends string> = `${UtilityKey}${T}`;

export default class OperationalSettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      const settings = await prisma.operationalSettings.findUnique({
        where: { propertyId: +propertyId },
      });
      res.json(settings);
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      const settings = req.body;

      // Validate settings
      for (const utility of ['electricity', 'water', 'internet']) {
        const { type, cost, dueDay } = settings[utility];
        if (!type || !cost || !dueDay) {
          throw { name: 'ValidationError', message: `Missing required fields for ${utility}` };
        }
        if (dueDay < 1 || dueDay > 28) {
          throw { name: 'ValidationError', message: `Due day must be between 1 and 28` };
        }
      }

      const updatedSettings = await prisma.operationalSettings.upsert({
        where: { propertyId: +propertyId },
        update: {
          electricityType: settings.electricity.type,
          waterType: settings.water.type,
          internetType: settings.internet.type,
          electricityCost: settings.electricity.cost,
          waterCost: settings.water.cost,
          internetCost: settings.internet.cost,
          electricityDueDay: settings.electricity.dueDay,
          waterDueDay: settings.water.dueDay,
          internetDueDay: settings.internet.dueDay,
        },
        create: {
          propertyId: +propertyId,
          electricityType: settings.electricity.type,
          waterType: settings.water.type,
          internetType: settings.internet.type,
          electricityCost: settings.electricity.cost,
          waterCost: settings.water.cost,
          internetCost: settings.internet.cost,
          electricityDueDay: settings.electricity.dueDay,
          waterDueDay: settings.water.dueDay,
          internetDueDay: settings.internet.dueDay,
        },
      });

      res.json(updatedSettings);
    } catch (err) {
      next(err);
    }
  }

  static async generateMonthlyExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      const settings = await prisma.operationalSettings.findUnique({
        where: { propertyId: +propertyId },
        include: { property: { include: { Renter: true } } },
      });

      if (!settings) throw { name: 'NotFoundError' };

      const today = new Date();
      const expenses = [];

      for (const utility of ['electricity', 'water', 'internet'] as const) {
        const typeKey = `${utility}Type` as UtilityField<'Type'>;
        const dueKey = `${utility}DueDay` as UtilityField<'DueDay'>;
        const costKey = `${utility}Cost` as UtilityField<'Cost'>;

        if (settings[typeKey] === 'POSTPAID') {
          const dueDay = settings[dueKey];
          const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);

          // If due date has passed, set for next month
          if (dueDate < today) {
            dueDate.setMonth(dueDate.getMonth() + 1);
          }

          for (const renter of settings.property.Renter) {
            expenses.push({
              renterId: renter.id,
              maintenanceType: 'OPERATIONAL',
              maintenanceCategory: utility,
              serviceDate: today,
              dueDate,
              servicePrice: settings[costKey] || 0,
              isOverdue: false,
              isPrepaid: false,
              serviceInvoice: 'auto-generated',
              lastPaymentDate: today,
              serviceDescription: `Monthly ${utility} payment`,
            });
          }
        }
      }

      await prisma.renterExpenses.createMany({ data: expenses });
      res.status(201).json({ message: 'Monthly expenses generated' });
    } catch (err) {
      next(err);
    }
  }
}
