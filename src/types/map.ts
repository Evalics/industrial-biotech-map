export const TAXONOMY_IDS = [
  'bioprocess',
  'strain_engineering',
  'lab_automation',
  'ai_ml_bioprocess',
  'software_lims_mes',
  'downstream',
  'media_inputs',
  'analytical_qc',
  'cdmo_scaleup',
  'hardware_bioreactors',
] as const;

export type TaxonomyId = (typeof TAXONOMY_IDS)[number];

export interface Source {
  url: string;
  note?: string;
}

export interface CompanyYaml {
  id: string;
  name: string;
  website: string;
  short_description: string;
  spaces: TaxonomyId[];
  primary_space: TaxonomyId;
  sources: Source[];
  hq_country?: string;
  embedding_text?: string;
  highlight?: boolean;
}

export interface TaxonomyEntry {
  id: TaxonomyId;
  label: string;
  color: string;
}

export interface CompanyMapNode {
  id: string;
  name: string;
  website: string;
  short_description: string;
  spaces: TaxonomyId[];
  primary_space: TaxonomyId;
  sources: Source[];
  hq_country?: string;
  highlight?: boolean;
  x: number;
  y: number;
}

export interface MapMeta {
  generated_at: string;
  company_count: number;
  embedding_model: string;
  layout_method: string;
}

export interface MapData {
  taxonomy: TaxonomyEntry[];
  companies: CompanyMapNode[];
  meta: MapMeta;
}
