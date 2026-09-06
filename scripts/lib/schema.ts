import { z } from 'zod';
import { TAXONOMY_IDS } from '../../src/types/map';

export const taxonomyIdSchema = z.enum(TAXONOMY_IDS);

export const sourceSchema = z.object({
  url: z.string().url(),
  note: z.string().optional(),
});

export const companyYamlBaseSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id must be kebab-case'),
  name: z.string().min(1),
  website: z.string().url(),
  short_description: z.string().min(10).max(500),
  spaces: z.array(taxonomyIdSchema).min(1),
  primary_space: taxonomyIdSchema,
  sources: z.array(sourceSchema).min(1),
  hq_country: z.string().optional(),
  embedding_text: z.string().optional(),
  highlight: z.boolean().optional(),
});

export const companyYamlSchema = companyYamlBaseSchema.refine(
  (c) => c.spaces.includes(c.primary_space),
  {
    message: 'primary_space must be included in spaces',
    path: ['primary_space'],
  },
);

export const taxonomyEntrySchema = z.object({
  id: taxonomyIdSchema,
  label: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const taxonomyFileSchema = z.array(taxonomyEntrySchema).length(TAXONOMY_IDS.length);

export const companyMapNodeSchema = companyYamlBaseSchema
  .omit({ embedding_text: true })
  .extend({
    x: z.number(),
    y: z.number(),
  });

export const mapMetaSchema = z.object({
  generated_at: z.string().datetime(),
  company_count: z.number().int().positive(),
  embedding_model: z.string(),
  layout_method: z.string(),
});

export const mapDataSchema = z.object({
  taxonomy: taxonomyFileSchema,
  companies: z.array(companyMapNodeSchema),
  meta: mapMetaSchema,
});

export type CompanyYamlInput = z.infer<typeof companyYamlSchema>;
export type TaxonomyEntryInput = z.infer<typeof taxonomyEntrySchema>;
