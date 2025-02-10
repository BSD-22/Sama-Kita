-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_roomId_fkey";

-- CreateTable
CREATE TABLE "IndividualRoom" (
    "id" SERIAL NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "IndividualRoom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IndividualRoom" ADD CONSTRAINT "IndividualRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "IndividualRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
