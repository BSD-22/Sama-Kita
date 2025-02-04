-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "propertyName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "operatorName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "typeName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "Area" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenterExpenses" (
    "id" SERIAL NOT NULL,
    "renterId" INTEGER NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "servicePrice" INTEGER NOT NULL,
    "serviceInvoice" TEXT NOT NULL,
    "videoService" TEXT NOT NULL,
    "lastPaymentDate" TIMESTAMP(3) NOT NULL,
    "depositAmount" INTEGER NOT NULL,

    CONSTRAINT "RenterExpenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Renter" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "renterName" TEXT NOT NULL,
    "renterEmail" TEXT NOT NULL,
    "renterPhone" TEXT NOT NULL,
    "ktpNumber" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,

    CONSTRAINT "Renter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_userId_key" ON "Property"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RenterExpenses_renterId_key" ON "RenterExpenses"("renterId");

-- CreateIndex
CREATE UNIQUE INDEX "Renter_userId_key" ON "Renter"("userId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Operator" ADD CONSTRAINT "Operator_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterExpenses" ADD CONSTRAINT "RenterExpenses_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "Renter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Renter" ADD CONSTRAINT "Renter_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
