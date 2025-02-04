/*
  Warnings:

  - You are about to drop the column `videoService` on the `RenterExpenses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RenterExpenses" DROP COLUMN "videoService",
ALTER COLUMN "serviceDescription" DROP NOT NULL;
