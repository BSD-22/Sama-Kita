import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class DashboardController {
  static async getPropertySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.loginInfo?.userId;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const subscriptionTier = req.headers['x-subscription-tier'] || 'FREE';
      const selectedPeriod = (req.query.period as string) || 'oneMonth';

      // Get all required data
      const [properties, transactions, expenses] = await prisma.$transaction([
        prisma.property.findMany({
          where: { userId },
          include: {
            Room: {
              include: {
                individualRooms: {
                  include: { renters: true },
                },
              },
            },
          },
        }),
        prisma.renterTransaction.findMany({
          where: {
            renter: {
              userId: userId,
            },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            renter: {
              include: {
                property: true,
              },
            },
          },
        }),
        prisma.renterExpenses.findMany({
          where: {
            renter: {
              userId: userId,
            },
          },
          include: {
            renter: {
              include: {
                property: true,
              },
            },
          },
        }),
      ]);

      const results: any = {};
      const now = new Date();
      const cutoffDate = new Date();

      // Set cutoff date based on selected period
      switch (selectedPeriod) {
        case 'oneMonth':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'sixMonths':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'oneYear':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Filter data for selected period
      const periodTransactions = transactions.filter((t) => new Date(t.createdAt) >= cutoffDate);
      const periodExpenses = expenses.filter((e) => new Date(e.serviceDate) >= cutoffDate);

      // Get previous period data
      const previousPeriodData = DashboardController.calculatePreviousPeriodData(
        transactions,
        expenses,
        cutoffDate,
        selectedPeriod,
      );

      // Calculate current period metrics
      const totalRevenue = DashboardController.calculateRevenue(periodTransactions);
      const totalExpenses = DashboardController.calculateExpenses(periodExpenses);
      const nettProfit = totalRevenue - totalExpenses;
      const occupancyRate = DashboardController.calculateOccupancyRate(properties);

      results[selectedPeriod] = {
        totalRevenue,
        nettProfit,
        averageOccupancyRate: occupancyRate.toFixed(1),
        totalProperties: properties.length,
        monthlyTrends: DashboardController.calculateMonthlyTrends(transactions, selectedPeriod),
        previousPeriod: previousPeriodData,
      };

      // Add additional data based on subscription tier
      if (subscriptionTier !== 'FREE') {
        results[selectedPeriod] = {
          ...results[selectedPeriod],
          predictedOccupancy: DashboardController.predictOccupancy(occupancyRate, periodTransactions).toFixed(1),
          recentTransactions: periodTransactions.slice(0, 5).map(DashboardController.formatTransaction),
          expenseBreakdown: DashboardController.calculateExpenseBreakdown(periodExpenses),
        };
      }

      if (subscriptionTier === 'PREMIUM') {
        results[selectedPeriod] = {
          ...results[selectedPeriod],
          propertyWiseAnalysis: DashboardController.analyzeProperties(properties, periodTransactions, periodExpenses),
          marketTrends: DashboardController.analyzeMarketTrends(periodTransactions, selectedPeriod),
          predictedMetrics: DashboardController.calculatePredictions(
            periodTransactions,
            periodExpenses,
            selectedPeriod,
          ),
        };
      }

      res.status(200).json(results);
    } catch (error) {
      console.error('Dashboard error:', error);
      next(error);
    }
  }

  private static calculateRevenue(transactions: any[]): number {
    // Only count completed payments
    return transactions.filter((t) => t.paymentStatus === true).reduce((sum, t) => sum + t.amount, 0);
  }

  private static calculateExpenses(expenses: any[]): number {
    // Sum all service prices from renter expenses
    return expenses.reduce((sum, e) => sum + e.servicePrice, 0);
  }

  private static calculateOccupancyRate(properties: any[]): number {
    const totalRooms = properties.reduce(
      (sum, p) => sum + p.Room.reduce((roomSum: number, r: any) => roomSum + r.totalRooms, 0),
      0,
    );

    const occupiedRooms = properties.reduce(
      (sum, p) =>
        sum +
        p.Room.reduce(
          (roomSum: number, r: any) =>
            roomSum + r.individualRooms.filter((ir: any) => ir.renters.some((renter: any) => !renter.hasLeaved)).length,
          0,
        ),
      0,
    );

    return totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  }

  private static predictOccupancy(currentOccupancy: number, transactions: any[]): number {
    // Simple prediction based on current occupancy and recent transaction volume
    const recentTransactionVolume = transactions.slice(0, 10).length;
    const predictedChange = recentTransactionVolume > 5 ? 5 : recentTransactionVolume;
    return Math.min(100, currentOccupancy + predictedChange);
  }

  private static formatTransaction(t: any) {
    return {
      amount: t.amount,
      orderId: t.id,
      paymentStatus: t.paymentStatus,
      renterName: t.renter?.renterName || 'Unknown',
      date: t.createdAt,
    };
  }

  private static calculateExpenseBreakdown(expenses: any[]) {
    return {
      maintenance: expenses.reduce((sum, e) => sum + (e.maintenanceType === 'MAINTENANCE' ? e.servicePrice : 0), 0),
      utilities: expenses.reduce((sum, e) => sum + (e.maintenanceType === 'UTILITIES' ? e.servicePrice : 0), 0),
    };
  }

  private static analyzeProperties(properties: any[], transactions: any[], expenses: any[]) {
    return properties.map((p) => ({
      propertyName: p.propertyName,
      revenue: DashboardController.calculatePropertyRevenue(p.id, transactions),
      occupancyRate: DashboardController.calculatePropertyOccupancy(p).toFixed(1),
      expenses: DashboardController.calculatePropertyExpenses(p.id, expenses),
    }));
  }

  private static calculateMonthlyTrends(transactions: any[], period: string) {
    const monthCount = period === 'oneYear' ? 12 : period === 'sixMonths' ? 6 : 1;

    return Array.from({ length: monthCount }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthTransactions = transactions.filter(
        (t) =>
          new Date(t.createdAt).getMonth() === month.getMonth() &&
          new Date(t.createdAt).getFullYear() === month.getFullYear() &&
          t.paymentStatus === true, // Only count completed payments
      );

      return {
        month: month.toLocaleString('default', { month: 'short' }),
        revenue: DashboardController.calculateRevenue(monthTransactions),
        occupancyRate: '0', // Default to 0 if no data
      };
    }).reverse();
  }

  private static calculatePropertyRevenue(propertyId: number, transactions: any[]): number {
    return transactions
      .filter((t) => t.renter.propertyId === propertyId && t.paymentStatus === true)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private static calculatePropertyOccupancy(property: any): number {
    const totalRooms = property.Room.reduce((sum: number, r: any) => sum + r.totalRooms, 0);
    const occupiedRooms = property.Room.reduce(
      (sum: number, r: any) =>
        sum + r.individualRooms.filter((ir: any) => ir.renters.some((renter: any) => !renter.hasLeaved)).length,
      0,
    );

    return totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  }

  private static calculatePropertyExpenses(propertyId: number, expenses: any[]): number {
    return expenses.filter((e) => e.renter.propertyId === propertyId).reduce((sum, e) => sum + e.servicePrice, 0);
  }

  private static calculatePreviousPeriodData(
    transactions: any[],
    expenses: any[],
    currentCutoff: Date,
    selectedPeriod: string,
  ) {
    const previousCutoff = new Date(currentCutoff);

    // Set previous period cutoff
    switch (selectedPeriod) {
      case 'oneMonth':
        previousCutoff.setMonth(previousCutoff.getMonth() - 1);
        break;
      case 'sixMonths':
        previousCutoff.setMonth(previousCutoff.getMonth() - 6);
        break;
      case 'oneYear':
        previousCutoff.setFullYear(previousCutoff.getFullYear() - 1);
        break;
    }

    const previousTransactions = transactions.filter(
      (t) => new Date(t.createdAt) >= previousCutoff && new Date(t.createdAt) < currentCutoff,
    );
    const previousExpenses = expenses.filter(
      (e) => new Date(e.serviceDate) >= previousCutoff && new Date(e.serviceDate) < currentCutoff,
    );

    return {
      totalRevenue: DashboardController.calculateRevenue(previousTransactions),
      totalExpenses: DashboardController.calculateExpenses(previousExpenses),
      nettProfit:
        DashboardController.calculateRevenue(previousTransactions) -
        DashboardController.calculateExpenses(previousExpenses),
    };
  }

  private static analyzeMarketTrends(transactions: any[], period: string) {
    // Implementation of analyzeMarketTrends method
  }

  private static calculatePredictions(transactions: any[], expenses: any[], period: string) {
    // Implementation of calculatePredictions method
  }
}
