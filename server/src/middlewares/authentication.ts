import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../helpers/jwt';
import { PrismaClient } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

const prisma = new PrismaClient();

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw { name: 'Unauthorized' };

    const access_token = authorization.split(' ')[1];

    const payload = verifyToken(access_token);

    if (typeof payload !== 'object' || payload === null) {
      throw { name: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: (payload as JwtPayload).email,
      },
    });
    if (!user) throw { name: 'Unauthorized' };

    req.loginInfo = {
      userId: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
