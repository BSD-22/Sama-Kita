-- AlterTable
ALTER TABLE "OperationalSettings" ADD COLUMN     "electricityDueDay" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "internetDueDay" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "waterDueDay" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "RenterExpenses" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "isOverdue" BOOLEAN NOT NULL DEFAULT false;
