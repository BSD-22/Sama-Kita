/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Renter` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `RenterTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Renter" DROP COLUMN "paymentStatus";

-- AlterTable
ALTER TABLE "RenterTransaction" ADD COLUMN     "paymentStatus" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "RenterTransaction_orderId_key" ON "RenterTransaction"("orderId");
