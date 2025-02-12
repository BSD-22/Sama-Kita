import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UtilityKey = 'electricity' | 'water' | 'internet';
type UtilityField<T extends string> = `${UtilityKey}${T}`;

export default class OperationalSettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      console.log('=== GET SETTINGS REQUEST ===');
      console.log('Property ID:', propertyId);

      let settings = await prisma.operationalSettings.findUnique({
        where: { propertyId: +propertyId },
      });

      console.log('=== FOUND SETTINGS ===', settings);

      // If no settings exist, create default settings
      if (!settings) {
        console.log('=== CREATING DEFAULT SETTINGS ===');
        settings = await prisma.operationalSettings.create({
          data: {
            propertyId: +propertyId,
            electricityType: 'POSTPAID',
            waterType: 'POSTPAID',
            internetType: 'POSTPAID',
            electricityCost: 0,
            waterCost: 0,
            internetCost: 0,
            electricityDueDay: 1,
            waterDueDay: 1,
            internetDueDay: 1,
          },
        });
        console.log('=== CREATED DEFAULT SETTINGS ===', settings);
      }

      res.json(settings);
    } catch (err) {
      console.error('=== ERROR IN GET SETTINGS ===', err);
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;
      const settings = req.body;
      console.log('Received settings:', settings);

      // Validate the flattened settings format
      const requiredFields = [
        'electricityType', 'waterType', 'internetType',
        'electricityCost', 'waterCost', 'internetCost',
        'electricityDueDay', 'waterDueDay', 'internetDueDay'
      ];

      for (const field of requiredFields) {
        if (settings[field] === undefined) {
          throw { 
            name: 'ValidationError', 
            message: `Missing required field: ${field}` 
          };
        }
      }

      // Validate due days
      const dueDayFields = ['electricityDueDay', 'waterDueDay', 'internetDueDay'];
      for (const field of dueDayFields) {
        const dueDay = settings[field];
        if (dueDay < 1 || dueDay > 28) {
          throw { 
            name: 'ValidationError', 
            message: `${field} must be between 1 and 28, got ${dueDay}` 
          };
        }
      }

      const updatedSettings = await prisma.operationalSettings.upsert({
        where: { propertyId: +propertyId },
        update: {
          electricityType: settings.electricityType,
          waterType: settings.waterType,
          internetType: settings.internetType,
          electricityCost: settings.electricityCost,
          waterCost: settings.waterCost,
          internetCost: settings.internetCost,
          electricityDueDay: settings.electricityDueDay,
          waterDueDay: settings.waterDueDay,
          internetDueDay: settings.internetDueDay,
        },
        create: {
          propertyId: +propertyId,
          electricityType: settings.electricityType,
          waterType: settings.waterType,
          internetType: settings.internetType,
          electricityCost: settings.electricityCost,
          waterCost: settings.waterCost,
          internetCost: settings.internetCost,
          electricityDueDay: settings.electricityDueDay,
          waterDueDay: settings.waterDueDay,
          internetDueDay: settings.internetDueDay,
        },
      });

      console.log('Updated settings:', updatedSettings);
      res.json(updatedSettings);
    } catch (err: unknown) {
      console.error('Error updating settings:', err);
      if (err instanceof Error) {
        if (err.name === 'ValidationError') {
          res.status(400).json({ error: err.message });
        } else {
          next(err);
        }
      } else {
        next(new Error('An unknown error occurred'));
      }
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
