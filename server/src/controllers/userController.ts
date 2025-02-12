import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class UserController {
  static async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;
      if (!userId) throw { name: 'AuthenticationError' };

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      res.status(200).json(subscription || { tier: 'FREE' });
    } catch (err) {
      next(err);
    }
  }
}
