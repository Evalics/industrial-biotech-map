import type { CompanyMapNode, TaxonomyId } from '../types/map';

export function filterCompanies(
  companies: CompanyMapNode[],
  selectedSpaces: TaxonomyId[],
  searchQuery: string,
): CompanyMapNode[] {
  const query = searchQuery.trim().toLowerCase();

  return companies.filter((company) => {
    const matchesSpaces =
      selectedSpaces.length === 0 ||
      selectedSpaces.every((space) => company.spaces.includes(space));

    if (!matchesSpaces) return false;

    if (!query) return true;

    const haystack = `${company.name} ${company.short_description}`.toLowerCase();
    return haystack.includes(query);
  });
}

export function getVisibleIds(
  companies: CompanyMapNode[],
  selectedSpaces: TaxonomyId[],
  searchQuery: string,
): Set<string> {
  return new Set(filterCompanies(companies, selectedSpaces, searchQuery).map((c) => c.id));
}
