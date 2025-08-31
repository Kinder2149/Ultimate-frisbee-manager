/*
  Parser Markdown -> JSON canonique pour import d'exercices
  - Lit docs/import/exercices/*.md
  - Frontmatter YAML via gray-matter
  - Sections Markdown pour variables, etc.
  - Écrit backend/scripts/output/import.json
*/

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Constantes partagées
const {
  TAG_CATEGORIES,
  NIVEAU_LABELS,
  isValidCategory,
  isValidLevel
} = require('../../shared/constants/tag-categories');

const INPUT_DIR = path.resolve(__dirname, '../../docs/import/exercices');
const OUTPUT_DIR = path.resolve(__dirname, './output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'import.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function normalizeWhitespace(str) {
  return (str || '').replace(/\r\n?/g, '\n').trim();
}

function extractSection(md, sectionTitle) {
  // Capture contenu entre `## sectionTitle` et prochain `##`
  const pattern = new RegExp(`(^|\n)##\\s+${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\s*\n([\s\S]*?)(?=\n##\s+|$)`, 'i');
  const match = md.match(pattern);
  return match ? match[2].trim() : '';
}

function listFromSection(md, sectionTitle) {
  const section = extractSection(md, sectionTitle);
  if (!section) return [];
  return section
    .split('\n')
    .map(l => l.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function concatSections(md, titles) {
  const parts = [];
  for (const t of titles) {
    const content = extractSection(md, t);
    if (content) parts.push(`## ${t}\n${content}`);
  }
  return parts.join('\n\n').trim();
}

function levelFromLabelOrNumber(value) {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  // Inverser NIVEAU_LABELS {1:'Débutant',...}
  const entry = Object.entries(NIVEAU_LABELS).find(([, label]) => label.toLowerCase() === s.toLowerCase());
  return entry ? parseInt(entry[0], 10) : undefined;
}

function toTagObjects(frontmatter) {
  const tags = [];
  // objectif
  (frontmatter.objectif || []).forEach(label => {
    tags.push({ label: String(label).trim(), category: TAG_CATEGORIES.OBJECTIF });
  });
  // travail spécifique
  (frontmatter.travail_specifique || []).forEach(label => {
    tags.push({ label: String(label).trim(), category: TAG_CATEGORIES.TRAVAIL_SPECIFIQUE });
  });
  // niveau
  if (frontmatter.niveau) {
    const level = levelFromLabelOrNumber(frontmatter.niveau);
    if (level) {
      tags.push({ label: NIVEAU_LABELS[level], category: TAG_CATEGORIES.NIVEAU, level });
    }
  }
  // temps
  if (frontmatter.temps) {
    tags.push({ label: String(frontmatter.temps).trim(), category: TAG_CATEGORIES.TEMPS });
  }
  // format
  if (frontmatter.format) {
    tags.push({ label: String(frontmatter.format).trim(), category: TAG_CATEGORIES.FORMAT });
  }
  // thèmes
  (frontmatter.theme_entrainement || []).forEach(label => {
    tags.push({ label: String(label).trim(), category: TAG_CATEGORIES.THEME_ENTRAINEMENT });
  });
  // validation locale simple (on laisse la validation stricte au backend)
  return tags.filter(t => isValidCategory(t.category) && (isValidLevel(t.level, t.category)));
}

function parseOneFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data: fm, content } = matter(raw);

  const variablesPlusList = listFromSection(content, 'Variables (+)');
  const variablesMinusList = listFromSection(content, 'Variables (-)');

  const description = concatSections(content, [
    'Description',
    'Phase 1',
    'Phase 2',
    'Phase 3',
    'Critères de réussite',
    'Matériel',
    'Durée',
    'Notes'
  ]);

  const exercice = {
    externalId: fm.externalId || null,
    nom: fm.title || path.basename(filePath, path.extname(filePath)),
    description: normalizeWhitespace(description),
    imageUrl: fm.imageUrl || null,
    schemaUrl: fm.schemaUrl || null,
    variablesPlus: variablesPlusList.join('; '),
    variablesMinus: variablesMinusList.join('; '),
    tags: toTagObjects(fm)
  };

  return exercice;
}

function main() {
  ensureDir(OUTPUT_DIR);
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Dossier introuvable: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.md'));
  const exercices = files.map(f => parseOneFile(path.join(INPUT_DIR, f)));

  const payload = { exercices };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`OK - ${exercices.length} exercice(s) parsé(s) -> ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main();
}
