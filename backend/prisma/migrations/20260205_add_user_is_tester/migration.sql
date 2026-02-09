-- AlterTable
 DO $$
 BEGIN
   IF NOT EXISTS (
     SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND lower(table_name) = 'user'
       AND lower(column_name) = 'istester'
   ) THEN
     EXECUTE 'ALTER TABLE "User" ADD COLUMN "isTester" BOOLEAN NOT NULL DEFAULT false';
   END IF;
 END $$;
