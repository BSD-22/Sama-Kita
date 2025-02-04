-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_userId_fkey";

-- DropForeignKey
ALTER TABLE "Operator" DROP CONSTRAINT "Operator_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Operator" DROP CONSTRAINT "Operator_userId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_userId_fkey";

-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Renter" DROP CONSTRAINT "Renter_userId_fkey";

-- DropForeignKey
ALTER TABLE "RenterExpenses" DROP CONSTRAINT "RenterExpenses_renterId_fkey";

-- DropForeignKey
ALTER TABLE "RenterTransaction" DROP CONSTRAINT "RenterTransaction_renterId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_propertyId_fkey";

-- AlterTable
ALTER TABLE "Operator" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterExpenses" ADD CONSTRAINT "RenterExpenses_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterTransaction" ADD CONSTRAINT "RenterTransaction_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
