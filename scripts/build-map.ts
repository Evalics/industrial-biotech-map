import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import {
  companyYamlSchema,
  taxonomyFileSchema,
  mapDataSchema,
  type CompanyYamlInput,
  type TaxonomyEntryInput,
} from './lib/schema';
import { layoutCompanies, EMBEDDING_MODEL, LAYOUT_METHOD } from './lib/layout';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const COMPANIES_DIR = join(DATA_DIR, 'companies');
const PUBLIC_DIR = join(ROOT, 'public');
const OUTPUT_PATH = join(PUBLIC_DIR, 'map.json');

function loadTaxonomy(): TaxonomyEntryInput[] {
  const raw = readFileSync(join(DATA_DIR, 'taxonomy.yaml'), 'utf8');
  const parsed = yaml.load(raw);
  const result = taxonomyFileSchema.safeParse(parsed);
  if (!result.success) {
    console.error('Invalid taxonomy.yaml:', result.error.format());
    process.exit(1);
  }
  const ids = result.data.map((t) => t.id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    console.error('taxonomy.yaml contains duplicate ids');
    process.exit(1);
  }
  return result.data;
}

function loadCompanies(): CompanyYamlInput[] {
  const files = readdirSync(COMPANIES_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const companies: CompanyYamlInput[] = [];

  for (const file of files) {
    const raw = readFileSync(join(COMPANIES_DIR, file), 'utf8');
    const parsed = yaml.load(raw);
    const result = companyYamlSchema.safeParse(parsed);
    if (!result.success) {
      console.error(`Invalid company file ${file}:`, result.error.format());
      process.exit(1);
    }
    if (result.data.id !== file.replace(/\.ya?ml$/, '')) {
      console.error(`Company id "${result.data.id}" must match filename ${file}`);
      process.exit(1);
    }
    companies.push(result.data);
  }

  return companies.sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  const taxonomy = loadTaxonomy();
  const companies = loadCompanies();

  if (companies.length < 1) {
    console.error('No companies found in data/companies/');
    process.exit(1);
  }

  const positions = layoutCompanies(companies);

  const mapCompanies = companies.map((c) => {
    const pos = positions.get(c.id)!;
    return {
      id: c.id,
      name: c.name,
      website: c.website,
      short_description: c.short_description,
      spaces: c.spaces,
      primary_space: c.primary_space,
      sources: c.sources,
      hq_country: c.hq_country,
      highlight: c.highlight,
      x: pos.x,
      y: pos.y,
    };
  });

  const mapData = {
    taxonomy,
    companies: mapCompanies,
    meta: {
      generated_at: new Date().toISOString(),
      company_count: mapCompanies.length,
      embedding_model: EMBEDDING_MODEL,
      layout_method: LAYOUT_METHOD,
    },
  };

  const validated = mapDataSchema.safeParse(mapData);
  if (!validated.success) {
    console.error('Generated map.json failed validation:', validated.error.format());
    process.exit(1);
  }

  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(validated.data, null, 2) + '\n');
  console.log(`Wrote ${OUTPUT_PATH} (${mapCompanies.length} companies)`);
}

main();
