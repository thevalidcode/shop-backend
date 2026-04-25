/*
  Warnings:

  - The primary key for the `admins` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "admins_uid_key";

-- AlterTable
ALTER TABLE "admins" DROP CONSTRAINT "admins_pkey",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "admins_id_seq";
