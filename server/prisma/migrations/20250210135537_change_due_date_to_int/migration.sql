/*
  Warnings:

  - Changed the type of `dueDate` on the `Property` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `dueDate` to the `RenterTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `RenterTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `RenterTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RenterTransaction" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isOverdue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "year" INTEGER NOT NULL;
