import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../helpers/bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import { signToken } from '../helpers/jwt';
import sendOtpEmail from '../helpers/nodemailer';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();

type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

type LoginPayload = {
  email: string;
};

type LoginOtpPayload = {
  otp: string;
  email: string;
};

type userOtp =
  | {
      userId: number;
      code: string;
      expiredDate: Date;
    }
  | undefined;

export default class authController {
  static async register(req: Request<unknown, unknown, RegisterPayload>, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;

      const user = await prisma.user.create({
        data: {
          email,
          password: await hashPassword(password),
          name: name,
        },
      });

      res.status(201).json(user);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async login(req: Request<unknown, unknown, LoginPayload>, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw { name: 'LoginError' };

      await prisma.oTP.deleteMany({
        where: {
          expiredDate: {
            lt: new Date(),
          },
        },
      });

      await prisma.oTP.deleteMany({
        where: {
          userId: user.id,
        },
      });

      let userOtp: userOtp;
      await prisma.$transaction(async (tx) => {
        userOtp = await tx.oTP.create({
          data: {
            userId: user.id,
            code: String(Math.floor(Math.random() * 900000) + 100000),
            expiredDate: new Date(Date.now() + 1000 * 60 * 1),
          },
        });

        // Uncomment this when ready to send real emails
        // await sendOtpEmail(user.email, userOtp.code);
      });

      res.status(200).json({
        otp: userOtp?.code,
        expiresIn: userOtp?.expiredDate,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.headers;
      if (!token || Array.isArray(token)) throw { name: 'Unauthorized' };

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: token,
      });

      const payload = ticket.getPayload();
      if (!payload) throw { name: 'LoginError' };

      const email = payload.email;
      const name = payload.name;

      const user = await prisma.user.upsert({
        where: {
          email: payload.email,
        },

        update: {},
        create: {
          email: payload.email || '',
          password: 'password_google',
        },
      });

      const access_token = signToken({
        id: user.id,
        email: user.email,
      });

      res.status(200).json({ access_token, email, name });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async loginOtp(req: Request<unknown, unknown, LoginOtpPayload>, res: Response, next: NextFunction) {
    try {
      const { otp, email } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw { name: 'LoginError' };

      const userOtp = await prisma.oTP.findFirst({
        where: {
          AND: [{ code: otp }, { userId: user.id }],
        },
      });
      if (!userOtp) throw { name: 'Unauthorized' };

      if (userOtp.code !== otp) {
        throw { name: 'OTPNotMatch' };
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
      };

      const access_token: string = signToken(payload);

      res.status(200).json({ access_token });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) throw { name: 'NotFoundError' };

      res.status(200).json({
        email: user.email,
        name: user.name,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async handleLogout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.loginInfo?.userId;

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw { name: 'NotFoundError' };

      await prisma.oTP.deleteMany({
        where: {
          userId: user.id,
        },
      });

      res.status(200).json({
        email: user.email,
        name: user.name,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}
