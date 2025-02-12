/*
  Warnings:

  - You are about to drop the column `isPaid` on the `RenterExpenses` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'OVERDUE');

-- AlterTable
ALTER TABLE "RenterExpenses" DROP COLUMN "isPaid",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "OwnerExpenseSettings" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "expenseCategory" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerExpenseSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerExpenses" (
    "id" SERIAL NOT NULL,
    "settingId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnerExpenses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OwnerExpenseSettings" ADD CONSTRAINT "OwnerExpenseSettings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerExpenses" ADD CONSTRAINT "OwnerExpenses_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "OwnerExpenseSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerExpenses" ADD CONSTRAINT "OwnerExpenses_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
