/*
  Warnings:

  - A unique constraint covering the columns `[propertyId]` on the table `Operator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `joinDate` to the `Renter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "hasLeaved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Operator_propertyId_key" ON "Operator"("propertyId");
