import midtransClient from 'midtrans-client';

import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SubscriptionPlan = {
  tier: 'BASIC' | 'PREMIUM';
  price: number;
  duration: number; // in months
};

const SUBSCRIPTION_PLANS: { [key: string]: SubscriptionPlan } = {
  BASIC: {
    tier: 'BASIC',
    price: 99000,
    duration: 1,
  },
  PREMIUM: {
    tier: 'PREMIUM',
    price: 299000,
    duration: 1,
  },
};

export default class SubscriptionController {
  static async getCurrentSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      res.status(200).json(subscription || { tier: 'FREE' });
    } catch (err) {
      next(err);
    }
  }

  static async createSubscriptionPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;
      if (!userId) throw { name: 'AuthenticationError' };
      const { tier } = req.body;

      const plan = SUBSCRIPTION_PLANS[tier];
      if (!plan) throw { name: 'ValidationError', message: 'Invalid subscription tier' };

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      if (!user) throw { name: 'NotFoundError', message: 'User not found' };

      // Initialize Midtrans
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.SERVER_MIDTRANS_KEY || '',
        clientKey: process.env.CLIENT_MIDTRANS_KEY || '',
      });

      const orderId = `sub_${Date.now()}_${userId}`;

      // Create Midtrans transaction
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: plan.price,
        },
        customer_details: {
          first_name: user.name || 'User',
          email: user.email,
        },
        item_details: [
          {
            id: tier,
            price: plan.price,
            quantity: 1,
            name: `${tier} Subscription - ${plan.duration} month(s)`,
          },
        ],
      };

      const { token } = await snap.createTransaction(parameter);

      // Store pending subscription
      await prisma.subscription.upsert({
        where: { userId },
        update: {
          tier: plan.tier,
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.duration * 30 * 24 * 60 * 60 * 1000),
          active: false, // Will be activated after payment
        },
        create: {
          userId,
          tier: plan.tier,
          startDate: new Date(),
          endDate: new Date(Date.now() + plan.duration * 30 * 24 * 60 * 60 * 1000),
          active: false,
        },
      });

      res.status(200).json({ token, orderId });
    } catch (err) {
      next(err);
    }
  }

  static async handlePaymentNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { order_id, transaction_status } = req.body;

      if (transaction_status === 'capture' || transaction_status === 'settlement') {
        const userId = parseInt(order_id.split('_')[2]);

        await prisma.subscription.update({
          where: { userId },
          data: { active: true },
        });
      }

      res.status(200).json({ status: 'OK' });
    } catch (err) {
      next(err);
    }
  }
}
