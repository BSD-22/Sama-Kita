/*
  Warnings:

  - You are about to drop the column `renterTransactionId` on the `Renter` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Renter_renterTransactionId_key";

-- AlterTable
ALTER TABLE "Renter" DROP COLUMN "renterTransactionId";
