-- AlterTable
ALTER TABLE "slaves" ADD COLUMN     "price_per_hour" DECIMAL(10,2) NOT NULL DEFAULT 4.00,
ADD COLUMN     "price_per_overtime_hour" DECIMAL(10,2) NOT NULL DEFAULT 6.00;
