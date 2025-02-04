/*
  Warnings:

  - A unique constraint covering the columns `[renterTransactionId]` on the table `Renter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[renterId]` on the table `RenterTransactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "renterTransactionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Renter_renterTransactionId_key" ON "Renter"("renterTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "RenterTransactions_renterId_key" ON "RenterTransactions"("renterId");
