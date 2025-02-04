/*
  Warnings:

  - Added the required column `leaveDate` to the `Renter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "leaveDate" TIMESTAMP(3) NOT NULL;
