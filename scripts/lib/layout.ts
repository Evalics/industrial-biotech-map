import type { CompanyYamlInput } from './schema';
import {
  buildDocumentMatrix,
  pca2D,
  scaleCoordinates,
  EMBEDDING_MODEL,
  LAYOUT_METHOD,
} from './embed';

export { EMBEDDING_MODEL, LAYOUT_METHOD };

export function companyToEmbeddingText(company: CompanyYamlInput): string {
  return [
    company.name,
    company.short_description,
    company.spaces.join(' '),
    company.primary_space,
    company.hq_country ?? '',
    company.embedding_text ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function layoutCompanies(companies: CompanyYamlInput[]): Map<string, { x: number; y: number }> {
  const texts = companies.map(companyToEmbeddingText);
  const matrix = buildDocumentMatrix(texts);
  const { x, y } = pca2D(matrix);
  const scaledX = scaleCoordinates(x);
  const scaledY = scaleCoordinates(y);

  const positions = new Map<string, { x: number; y: number }>();
  companies.forEach((company, i) => {
    positions.set(company.id, {
      x: scaledX[i] ?? 0,
      y: scaledY[i] ?? 0,
    });
  });

  return positions;
}
