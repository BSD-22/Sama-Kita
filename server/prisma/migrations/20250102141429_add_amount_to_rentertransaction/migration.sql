/*
  Warnings:

  - Added the required column `amount` to the `RenterTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RenterTransaction" ADD COLUMN     "amount" INTEGER NOT NULL;
