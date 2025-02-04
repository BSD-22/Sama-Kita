/*
  Warnings:

  - You are about to drop the column `depositAmount` on the `RenterExpenses` table. All the data in the column will be lost.
  - Added the required column `depositAmount` to the `Renter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "depositAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RenterExpenses" DROP COLUMN "depositAmount";
