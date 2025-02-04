/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `Renter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Renter" DROP COLUMN "paymentStatus";

-- CreateTable
CREATE TABLE "RenterTransactions" (
    "id" SERIAL NOT NULL,
    "renterId" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentStatus" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RenterTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RenterTransactions_orderId_key" ON "RenterTransactions"("orderId");

-- AddForeignKey
ALTER TABLE "RenterTransactions" ADD CONSTRAINT "RenterTransactions_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
