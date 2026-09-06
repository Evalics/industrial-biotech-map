import type { TaxonomyEntry } from '../types/map';

interface LegendProps {
  taxonomy: TaxonomyEntry[];
}

export function Legend({ taxonomy }: LegendProps) {
  return (
    <aside className="legend" aria-label="Map legend">
      <h2>Spaces</h2>
      <ul>
        {taxonomy.map((space) => (
          <li key={space.id}>
            <span className="legend__swatch" style={{ background: space.color }} />
            {space.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}
