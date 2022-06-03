-- DropForeignKey
ALTER TABLE "slaves" DROP CONSTRAINT "slaves_ownerId_fkey";

-- AlterTable
ALTER TABLE "slaves" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_type" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "slaves" ADD CONSTRAINT "slaves_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
