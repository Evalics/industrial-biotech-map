import { describe, it, expect } from 'vitest';
import {
  companyYamlSchema,
  taxonomyFileSchema,
  mapDataSchema,
} from '../scripts/lib/schema';

describe('companyYamlSchema', () => {
  const valid = {
    id: 'example-co',
    name: 'Example Co',
    website: 'https://example.com',
    short_description: 'Industrial biotech example company for testing schema validation.',
    spaces: ['bioprocess', 'strain_engineering'],
    primary_space: 'bioprocess',
    sources: [{ url: 'https://example.com/about', note: 'About page' }],
    hq_country: 'USA',
  };

  it('accepts valid company yaml', () => {
    expect(companyYamlSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects primary_space not in spaces', () => {
    const result = companyYamlSchema.safeParse({
      ...valid,
      primary_space: 'downstream',
    });
    expect(result.success).toBe(false);
  });

  it('requires at least one source', () => {
    const result = companyYamlSchema.safeParse({ ...valid, sources: [] });
    expect(result.success).toBe(false);
  });

  it('requires kebab-case id', () => {
    const result = companyYamlSchema.safeParse({ ...valid, id: 'Bad_Id' });
    expect(result.success).toBe(false);
  });
});

describe('taxonomyFileSchema', () => {
  it('accepts all 10 taxonomy entries', () => {
    const entries = [
      { id: 'bioprocess', label: 'Bioprocess', color: '#0d9488' },
      { id: 'strain_engineering', label: 'Strain Engineering', color: '#7c3aed' },
      { id: 'lab_automation', label: 'Lab Automation', color: '#2563eb' },
      { id: 'ai_ml_bioprocess', label: 'AI / ML Bioprocess', color: '#db2777' },
      { id: 'software_lims_mes', label: 'Software / LIMS / MES', color: '#0891b2' },
      { id: 'downstream', label: 'Downstream', color: '#ca8a04' },
      { id: 'media_inputs', label: 'Media & Inputs', color: '#65a30d' },
      { id: 'analytical_qc', label: 'Analytical / QC', color: '#ea580c' },
      { id: 'cdmo_scaleup', label: 'CDMO / Scale-up', color: '#dc2626' },
      { id: 'hardware_bioreactors', label: 'Hardware / Bioreactors', color: '#4f46e5' },
    ];
    expect(taxonomyFileSchema.safeParse(entries).success).toBe(true);
  });
});

describe('mapDataSchema', () => {
  it('accepts minimal valid map.json shape', () => {
    const data = {
      taxonomy: [
        { id: 'bioprocess', label: 'Bioprocess', color: '#0d9488' },
        { id: 'strain_engineering', label: 'Strain Engineering', color: '#7c3aed' },
        { id: 'lab_automation', label: 'Lab Automation', color: '#2563eb' },
        { id: 'ai_ml_bioprocess', label: 'AI / ML Bioprocess', color: '#db2777' },
        { id: 'software_lims_mes', label: 'Software / LIMS / MES', color: '#0891b2' },
        { id: 'downstream', label: 'Downstream', color: '#ca8a04' },
        { id: 'media_inputs', label: 'Media & Inputs', color: '#65a30d' },
        { id: 'analytical_qc', label: 'Analytical / QC', color: '#ea580c' },
        { id: 'cdmo_scaleup', label: 'CDMO / Scale-up', color: '#dc2626' },
        { id: 'hardware_bioreactors', label: 'Hardware / Bioreactors', color: '#4f46e5' },
      ],
      companies: [
        {
          id: 'test-co',
          name: 'Test Co',
          website: 'https://test.com',
          short_description: 'A test industrial biotech company for map validation purposes.',
          spaces: ['bioprocess'],
          primary_space: 'bioprocess',
          sources: [{ url: 'https://test.com' }],
          x: 10,
          y: -20,
        },
      ],
      meta: {
        generated_at: new Date().toISOString(),
        company_count: 1,
        embedding_model: 'bag-of-words-v1',
        layout_method: 'pca-2d-v1',
      },
    };
    expect(mapDataSchema.safeParse(data).success).toBe(true);
  });
});
