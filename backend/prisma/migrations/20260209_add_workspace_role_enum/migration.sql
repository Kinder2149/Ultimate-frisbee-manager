-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('MANAGER', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" DROP DEFAULT;
UPDATE "WorkspaceUser" SET "role" = UPPER("role") WHERE "role" IS NOT NULL;
UPDATE "WorkspaceUser" SET "role" = 'MEMBER' WHERE "role" NOT IN ('MANAGER', 'MEMBER', 'VIEWER');
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" TYPE "WorkspaceRole" USING ("role"::text::"WorkspaceRole");
ALTER TABLE "WorkspaceUser" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::"WorkspaceRole";
