/*
  Warnings:

  - You are about to drop the column `roomId` on the `Renter` table. All the data in the column will be lost.
  - Made the column `individualRoomId` on table `Renter` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_individualRoomId_fkey";

-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_roomId_fkey";

-- AlterTable
ALTER TABLE "Renter" DROP COLUMN "roomId",
ALTER COLUMN "individualRoomId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_individualRoomId_fkey" FOREIGN KEY ("individualRoomId") REFERENCES "IndividualRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
