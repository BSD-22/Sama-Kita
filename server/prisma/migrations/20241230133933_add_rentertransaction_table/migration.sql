-- CreateTable
CREATE TABLE "RenterTransaction" (
    "id" SERIAL NOT NULL,
    "renterId" INTEGER NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "RenterTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RenterTransaction" ADD CONSTRAINT "RenterTransaction_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
