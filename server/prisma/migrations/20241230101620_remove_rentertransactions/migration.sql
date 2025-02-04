/*
  Warnings:

  - You are about to drop the `RenterTransactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RenterTransactions" DROP CONSTRAINT "RenterTransactions_renterId_fkey";

-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "paymentStatus" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "RenterTransactions";
