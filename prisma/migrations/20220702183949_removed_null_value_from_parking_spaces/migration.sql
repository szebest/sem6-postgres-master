/*
  Warnings:

  - Made the column `parking_spaces` on table `slaves` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "slaves" ALTER COLUMN "parking_spaces" SET NOT NULL;
