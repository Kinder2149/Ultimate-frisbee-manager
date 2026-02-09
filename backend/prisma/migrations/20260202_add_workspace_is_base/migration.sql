-- AlterTable
 DO $$
 BEGIN
   IF NOT EXISTS (
     SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND lower(table_name) = 'workspace'
       AND lower(column_name) = 'isbase'
   ) THEN
     EXECUTE 'ALTER TABLE "Workspace" ADD COLUMN "isBase" BOOLEAN NOT NULL DEFAULT false';
   END IF;
 END $$;
