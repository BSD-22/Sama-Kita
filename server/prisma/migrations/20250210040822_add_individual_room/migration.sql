-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_roomId_fkey";

-- AlterTable
ALTER TABLE "Renter" ADD COLUMN     "individualRoomId" INTEGER;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_individualRoomId_fkey" FOREIGN KEY ("individualRoomId") REFERENCES "IndividualRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
