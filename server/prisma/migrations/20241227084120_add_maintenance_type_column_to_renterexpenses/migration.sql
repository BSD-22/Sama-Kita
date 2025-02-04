/*
  Warnings:

  - Added the required column `maintenanceType` to the `RenterExpenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RenterExpenses" ADD COLUMN     "maintenanceType" TEXT NOT NULL;
