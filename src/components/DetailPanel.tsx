import type { CompanyMapNode, TaxonomyEntry } from '../types/map';

interface DetailPanelProps {
  company: CompanyMapNode | null;
  taxonomy: TaxonomyEntry[];
  onClose: () => void;
}

export function DetailPanel({ company, taxonomy, onClose }: DetailPanelProps) {
  if (!company) return null;

  const taxonomyById = new Map(taxonomy.map((t) => [t.id, t]));

  return (
    <>
      <div className="detail-panel__backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${company.name} details`}
      >
        <div className="detail-panel__header">
          <div>
            <h2>{company.name}</h2>
            {company.highlight && <span className="detail-panel__badge">Featured</span>}
          </div>
          <button type="button" className="detail-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="detail-panel__description">{company.short_description}</p>

        {company.hq_country && (
          <p className="detail-panel__meta">
            <strong>HQ:</strong> {company.hq_country}
          </p>
        )}

        <div className="detail-panel__section">
          <h3>Spaces</h3>
          <ul className="detail-panel__tags">
            {company.spaces.map((spaceId) => {
              const space = taxonomyById.get(spaceId);
              return (
                <li
                  key={spaceId}
                  style={{ '--tag-color': space?.color ?? '#64748b' } as React.CSSProperties}
                >
                  {space?.label ?? spaceId}
                  {spaceId === company.primary_space ? ' (primary)' : ''}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="detail-panel__section">
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="detail-panel__link">
            Visit website ↗
          </a>
        </div>

        <div className="detail-panel__section">
          <h3>Sources</h3>
          <ul className="detail-panel__sources">
            {company.sources.map((source, i) => (
              <li key={`${source.url}-${i}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.note ?? source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
