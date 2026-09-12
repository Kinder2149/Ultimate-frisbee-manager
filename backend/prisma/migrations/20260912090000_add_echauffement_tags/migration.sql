-- Étiquettes sur les échauffements (famille : physique / réveil musculaire, etc.)
CREATE TABLE "_EchauffementTags" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_EchauffementTags_AB_unique" ON "_EchauffementTags"("A", "B");
CREATE INDEX "_EchauffementTags_B_index" ON "_EchauffementTags"("B");

ALTER TABLE "_EchauffementTags" ADD CONSTRAINT "_EchauffementTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Echauffement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_EchauffementTags" ADD CONSTRAINT "_EchauffementTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
