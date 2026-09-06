import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CompanyMapNode, MapData } from './types/map';
import { filterCompanies } from './lib/filterCompanies';
import { FilterBar } from './components/FilterBar';
import { MapCanvas } from './components/MapCanvas';
import { Legend } from './components/Legend';
import { DetailPanel } from './components/DetailPanel';
import './App.css';

function App() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpaces, setSelectedSpaces] = useState<MapData['taxonomy'][number]['id'][]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/map.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load map.json (${res.status})`);
        return res.json();
      })
      .then((data: MapData) => setMapData(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  const visibleCompanies = useMemo(() => {
    if (!mapData) return [];
    return filterCompanies(mapData.companies, selectedSpaces, searchQuery);
  }, [mapData, selectedSpaces, searchQuery]);

  const selectedCompany = useMemo<CompanyMapNode | null>(() => {
    if (!mapData || !selectedId) return null;
    return mapData.companies.find((c) => c.id === selectedId) ?? null;
  }, [mapData, selectedId]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  if (error) {
    return (
      <div className="app app--error">
        <p>Unable to load map data: {error}</p>
        <p className="app__hint">Run <code>npm run build:map</code> to generate public/map.json.</p>
      </div>
    );
  }

  if (!mapData) {
    return <div className="app app--loading">Loading industrial biotech map…</div>;
  }

  return (
    <div className="app">
      <FilterBar
        taxonomy={mapData.taxonomy}
        selectedSpaces={selectedSpaces}
        onSpacesChange={setSelectedSpaces}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        visibleCount={visibleCompanies.length}
        totalCount={mapData.companies.length}
      />

      <main className="app__main">
        <MapCanvas
          companies={mapData.companies}
          taxonomy={mapData.taxonomy}
          selectedSpaces={selectedSpaces}
          searchQuery={searchQuery}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <Legend taxonomy={mapData.taxonomy} />
      </main>

      <DetailPanel
        company={selectedCompany}
        taxonomy={mapData.taxonomy}
        onClose={() => setSelectedId(null)}
      />

      <footer className="app__footer">
        <span>{mapData.meta.company_count} companies · layout {mapData.meta.layout_method}</span>
        <a href="https://differential.bio" target="_blank" rel="noopener noreferrer">
          Differential Bio
        </a>
      </footer>
    </div>
  );
}

export default App;
