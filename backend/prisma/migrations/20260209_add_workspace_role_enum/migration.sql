-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('MANAGER', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" TYPE "WorkspaceRole" USING (role::"WorkspaceRole");
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"WorkspaceRole";
