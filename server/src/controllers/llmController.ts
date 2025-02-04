import { NextFunction, Request, Response } from 'express';
import Groq from 'groq-sdk';
import { ChatCompletion } from 'groq-sdk/resources/chat/completions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type ReqBodyPayload = {
  message: string;
};

export default class llmController {
  static async getResponsePublic(req: Request<unknown, unknown, ReqBodyPayload>, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      if (!message) throw { name: 'LLMBadRequest' };

      const llmResponse: ChatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant designed for the Sama Kita landing page. Your purpose is to provide concise, friendly, and relevant answers about Sama Kita`s services, which focus on automating and migrating data for sharehomes (kos-kosan). Highlight how Sama Kita helps users streamline operations and achieve passive income with minimal effort. Avoid discussing unrelated topics or making assumptions outside the scope of Sama Kita. When users inquire about joining, guide them to the wishlist sign-up process via the provided Google Form link. Maintain an approachable, professional tone that aligns with Sama Kita`s mission of empowering sharehome owners. Make your answer as little but informative as possible since we only have a small textboxes for the answer.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'llama3-8b-8192',
      });

      const llmMsg: string = llmResponse.choices[0].message.content || '';

      res.status(200).json({
        message: llmMsg,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async getPropertySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [oneMonthRevenue, oneMonthExpenses, oneMonthOccupancy, oneMonthRecentSales, sixMonthRevenue, sixMonthExpenses, sixMonthOccupancy, sixMonthRecentSales, oneYearRevenue, oneYearExpenses, oneYearOccupancy, oneYearRecentSales] = await prisma.$transaction([
        // 1 month data - Total Revenue (exclude transactions with paymentStatus: false)
        prisma.renterTransaction.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
            paymentStatus: true,
          },
        }),
        // 1 month data - Total Expenses
        prisma.renterExpenses.aggregate({
          _sum: { servicePrice: true },
          where: { serviceDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
        }),
        // 1 month data - Occupancy Rate
        prisma.renter.count({ where: { hasLeaved: false } }),
        // 1 month data - Recent Sales (include renterName)
        prisma.renterTransaction.findMany({
          where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
          include: { renter: { select: { renterName: true } } }, // Include renterName
        }),
        // 6 months data - Total Revenue
        prisma.renterTransaction.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
            paymentStatus: true,
          },
        }),

        // 6 months data - Total Expenses
        prisma.renterExpenses.aggregate({
          _sum: { servicePrice: true },
          where: { serviceDate: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } },
        }),

        // 6 months data - Occupancy Rate
        prisma.renter.count({ where: { hasLeaved: false } }),

        // 6 months data - Recent Sales (include renterName)
        prisma.renterTransaction.findMany({
          where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } },
          include: { renter: { select: { renterName: true } } }, // Include renterName
        }),
        // 1 year data - Total Revenue
        prisma.renterTransaction.aggregate({
          _sum: { amount: true },
          where: {
            createdAt: { gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) },
            paymentStatus: true,
          },
        }),
        // 1 year data - Total Expenses
        prisma.renterExpenses.aggregate({
          _sum: { servicePrice: true },
          where: { serviceDate: { gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } },
        }),
        // 1 year data - Occupancy Rate
        prisma.renter.count({ where: { hasLeaved: false } }),
        // 1 year data - Recent Sales (include renterName)
        prisma.renterTransaction.findMany({
          where: { createdAt: { gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } },
          include: { renter: { select: { renterName: true } } }, // Include renterName
        }),
      ]);

      const processData = async (revenueData: { _sum: { amount: number | null } }, expenseData: { _sum: { servicePrice: number | null } }, occupancyData: number, salesData: { createdAt: Date; amount: number; renter: { renterName: string }; paymentStatus: boolean }[], period: 'oneMonth' | 'sixMonths' | 'oneYear') => {
        const totalRevenue = revenueData._sum.amount || 0;
        const totalExpenses = expenseData._sum.servicePrice || 0;

        const rooms = await prisma.room.findMany();
        const totalRooms = rooms.reduce((acc, room) => acc + room.totalRooms, 0);
        const averageOccupancyRate = rooms ? `${((occupancyData / totalRooms) * 100).toFixed(2)}` : '0';

        const recentSales = salesData.map((sale) => ({
          createdAt: sale.createdAt,
          amount: sale.amount,
          renterName: sale.renter.renterName, // Extract renterName
          paymentStatus: sale.paymentStatus,
        }));

        const nettProfit = totalRevenue - totalExpenses;

        return {
          totalRevenue,
          nettProfit,
          averageOccupancyRate,
          recentSales,
        };
      };

      const oneMonth = await processData(oneMonthRevenue, oneMonthExpenses, oneMonthOccupancy, oneMonthRecentSales, 'oneMonth');
      const sixMonths = await processData(sixMonthRevenue, sixMonthExpenses, sixMonthOccupancy, sixMonthRecentSales, 'sixMonths');
      const oneYear = await processData(oneYearRevenue, oneYearExpenses, oneYearOccupancy, oneYearRecentSales, 'oneYear');

      res.status(200).json({
        oneMonth,
        sixMonths,
        oneYear,
      });
    } catch (error) {
      console.log('Error fetching property summary:', error);
      next(error);
    }
  }
}
