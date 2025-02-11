/*
  Warnings:

  - Added the required column `maintenanceCategory` to the `RenterExpenses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RenterExpenses" ADD COLUMN     "maintenanceCategory" TEXT NOT NULL;
