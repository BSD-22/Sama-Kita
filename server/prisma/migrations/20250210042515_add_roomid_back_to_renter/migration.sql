/*
  Warnings:

  - Added the required column `roomId` to the `Renter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "roomId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
