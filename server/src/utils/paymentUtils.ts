import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkAndUpdatePaymentStatus = async (renterId: number) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Get renter and property details
  const renter = await prisma.renter.findUnique({
    where: { id: renterId },
    include: {
      property: true,
      room: true,
      RenterTransaction: {
        where: {
          month: currentMonth,
          year: currentYear,
        },
      },
    },
  });

  if (!renter) throw new Error('Renter not found');

  // Check if there's a transaction for current month
  const currentTransaction = renter.RenterTransaction[0];

  if (!currentTransaction) {
    // Create new transaction for current month
    const dueDate = new Date(currentYear, currentMonth - 1, renter.property.dueDate);

    return await prisma.renterTransaction.create({
      data: {
        renterId,
        orderId: `INV-${renterId}-${currentYear}${currentMonth}`,
        amount: renter.room.price,
        dueDate,
        month: currentMonth,
        year: currentYear,
        isOverdue: today > dueDate,
      },
    });
  }

  // Update overdue status if needed
  if (!currentTransaction.paymentStatus && today > currentTransaction.dueDate) {
    return await prisma.renterTransaction.update({
      where: { id: currentTransaction.id },
      data: { isOverdue: true },
    });
  }

  return currentTransaction;
};
