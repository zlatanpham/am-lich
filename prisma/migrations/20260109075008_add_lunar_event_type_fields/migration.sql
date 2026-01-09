/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- AlterTable
ALTER TABLE "LunarEvent" ADD COLUMN     "ancestorName" VARCHAR(255),
ADD COLUMN     "ancestorPrecall" VARCHAR(100),
ADD COLUMN     "eventType" VARCHAR(50) NOT NULL DEFAULT 'general';

-- DropTable
DROP TABLE "Event";
