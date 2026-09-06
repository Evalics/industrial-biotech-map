import type { CSSProperties } from 'react';
import type { TaxonomyEntry, TaxonomyId } from '../types/map';

interface FilterBarProps {
  taxonomy: TaxonomyEntry[];
  selectedSpaces: TaxonomyId[];
  onSpacesChange: (spaces: TaxonomyId[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  visibleCount: number;
  totalCount: number;
}

export function FilterBar({
  taxonomy,
  selectedSpaces,
  onSpacesChange,
  searchQuery,
  onSearchChange,
  visibleCount,
  totalCount,
}: FilterBarProps) {
  const toggleSpace = (id: TaxonomyId) => {
    if (selectedSpaces.includes(id)) {
      onSpacesChange(selectedSpaces.filter((s) => s !== id));
    } else {
      onSpacesChange([...selectedSpaces, id]);
    }
  };

  return (
    <header className="filter-bar">
      <div className="filter-bar__brand">
        <h1>Industrial Biotech Map</h1>
        <p className="filter-bar__subtitle">Curated by Differential Bio</p>
      </div>

      <div className="filter-bar__search">
        <input
          type="search"
          placeholder="Search companies…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search companies"
        />
        <span className="filter-bar__count" aria-live="polite">
          {visibleCount} / {totalCount}
        </span>
      </div>

      <div className="filter-bar__chips" role="group" aria-label="Filter by space">
        {taxonomy.map((space) => {
          const active = selectedSpaces.includes(space.id);
          return (
            <button
              key={space.id}
              type="button"
              className={`chip ${active ? 'chip--active' : ''}`}
              style={{ '--chip-color': space.color } as CSSProperties}
              onClick={() => toggleSpace(space.id)}
              aria-pressed={active}
            >
              {space.label}
            </button>
          );
        })}
        {selectedSpaces.length > 0 && (
          <button
            type="button"
            className="chip chip--clear"
            onClick={() => onSpacesChange([])}
          >
            Clear filters
          </button>
        )}
      </div>
    </header>
  );
}
