import { describe, it, expect } from 'vitest';
import { filterCompanies } from '../src/lib/filterCompanies';
import type { CompanyMapNode } from '../src/types/map';

const sample: CompanyMapNode[] = [
  {
    id: 'a',
    name: 'Alpha Bioprocess',
    website: 'https://alpha.example',
    short_description: 'Upstream bioprocess development and scale-up services.',
    spaces: ['bioprocess', 'cdmo_scaleup'],
    primary_space: 'bioprocess',
    sources: [{ url: 'https://alpha.example' }],
    x: 0,
    y: 0,
  },
  {
    id: 'b',
    name: 'Beta Automation',
    website: 'https://beta.example',
    short_description: 'Lab automation robotics for strain engineering workflows.',
    spaces: ['lab_automation', 'strain_engineering'],
    primary_space: 'lab_automation',
    sources: [{ url: 'https://beta.example' }],
    x: 10,
    y: 10,
  },
  {
    id: 'c',
    name: 'Gamma CDMO',
    website: 'https://gamma.example',
    short_description: 'Contract biomanufacturing and downstream purification.',
    spaces: ['cdmo_scaleup', 'downstream'],
    primary_space: 'cdmo_scaleup',
    sources: [{ url: 'https://gamma.example' }],
    x: -10,
    y: 5,
  },
];

describe('filterCompanies', () => {
  it('returns all companies when no filters applied', () => {
    expect(filterCompanies(sample, [], '')).toHaveLength(3);
  });

  it('filters by intersection of selected spaces', () => {
    const result = filterCompanies(sample, ['strain_engineering'], '');
    expect(result.map((c) => c.id)).toEqual(['b']);
  });

  it('requires all selected spaces (intersection)', () => {
    const result = filterCompanies(sample, ['bioprocess', 'cdmo_scaleup'], '');
    expect(result.map((c) => c.id)).toEqual(['a']);
  });

  it('filters by search query on name and description', () => {
    const result = filterCompanies(sample, [], 'downstream');
    expect(result.map((c) => c.id)).toEqual(['c']);
  });

  it('combines space and search filters', () => {
    const result = filterCompanies(sample, ['cdmo_scaleup'], 'biomanufacturing');
    expect(result.map((c) => c.id)).toEqual(['c']);
  });
});
