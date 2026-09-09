-- AlterTable
ALTER TABLE "Entrainement" ADD COLUMN     "rang" INTEGER;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "parentId" TEXT;

-- CreateTable
CREATE TABLE "_EntrainementLexique" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EntrainementLexique_AB_unique" ON "_EntrainementLexique"("A", "B");

-- CreateIndex
CREATE INDEX "_EntrainementLexique_B_index" ON "_EntrainementLexique"("B");

-- CreateIndex
CREATE INDEX "Tag_parentId_idx" ON "Tag"("parentId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EntrainementLexique" ADD CONSTRAINT "_EntrainementLexique_A_fkey" FOREIGN KEY ("A") REFERENCES "Entrainement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EntrainementLexique" ADD CONSTRAINT "_EntrainementLexique_B_fkey" FOREIGN KEY ("B") REFERENCES "Lexique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

