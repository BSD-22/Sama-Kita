-- CreateEnum
CREATE TYPE "OperationalExpenseType" AS ENUM ('PREPAID', 'POSTPAID');

-- AlterTable
ALTER TABLE "RenterExpenses" ADD COLUMN     "durationMonths" INTEGER,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isPrepaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OperationalSettings" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "electricityType" "OperationalExpenseType" NOT NULL DEFAULT 'POSTPAID',
    "waterType" "OperationalExpenseType" NOT NULL DEFAULT 'POSTPAID',
    "internetType" "OperationalExpenseType" NOT NULL DEFAULT 'POSTPAID',
    "electricityDuration" INTEGER,
    "waterDuration" INTEGER,
    "internetDuration" INTEGER,
    "electricityCost" INTEGER,
    "waterCost" INTEGER,
    "internetCost" INTEGER,

    CONSTRAINT "OperationalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationalSettings_propertyId_key" ON "OperationalSettings"("propertyId");

-- AddForeignKey
ALTER TABLE "OperationalSettings" ADD CONSTRAINT "OperationalSettings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
