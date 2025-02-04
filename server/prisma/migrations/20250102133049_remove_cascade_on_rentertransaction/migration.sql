-- DropForeignKey
ALTER TABLE "RenterTransaction" DROP CONSTRAINT "RenterTransaction_renterId_fkey";

-- AddForeignKey
ALTER TABLE "RenterTransaction" ADD CONSTRAINT "RenterTransaction_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
