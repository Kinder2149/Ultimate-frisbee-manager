/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `securityAnswer` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `securityQuestion` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "securityAnswer",
DROP COLUMN "securityQuestion",
ALTER COLUMN "role" SET DEFAULT 'USER';
