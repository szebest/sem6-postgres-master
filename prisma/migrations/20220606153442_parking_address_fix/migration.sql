/*
  Warnings:

  - You are about to drop the column `parkingAddress` on the `slaves` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "slaves" DROP COLUMN "parkingAddress",
ADD COLUMN     "parking_address" VARCHAR(255) NOT NULL DEFAULT E'';
