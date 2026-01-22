import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchBar } from './components/SearchBar';
import { PrefectureFilter } from './components/PrefectureFilter';
import { LocationButton } from './components/LocationButton';
import { PharmacyList } from './components/PharmacyList';
import { Map } from './components/Map';
import { PharmacyDetail } from './components/PharmacyDetail';
import { useGeolocation } from './hooks/useGeolocation';
import { usePharmacies } from './hooks/usePharmacies';
import type { PharmacyWithDistance } from './types/pharmacy';

type ViewMode = 'list' | 'map';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);

  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearLocation,
  } = useGeolocation();

  const {
    pharmacies,
    meta,
    loading,
    error,
    searchParams,
    setSearchParams,
    prefectureCounts,
  } = usePharmacies(userLocation);

  const handleSearch = useCallback((query: string) => {
    setSearchParams({ query: query || undefined });
  }, [setSearchParams]);

  const handlePrefectureChange = useCallback((prefecture: string) => {
    setSearchParams({ prefecture: prefecture || undefined });
  }, [setSearchParams]);

  const handlePharmacyClick = useCallback((pharmacy: PharmacyWithDistance) => {
    setSelectedPharmacy(pharmacy);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header meta={meta} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* 検索フィルター */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div>
              <PrefectureFilter
                value={searchParams.prefecture || ''}
                onChange={handlePrefectureChange}
                counts={prefectureCounts}
              />
            </div>
          </div>

          <div className="mt-4">
            <LocationButton
              onClick={getCurrentLocation}
              loading={locationLoading}
              hasLocation={!!userLocation}
              onClear={clearLocation}
            />
            {locationError && (
              <p className="mt-2 text-sm text-red-600">{locationError}</p>
            )}
          </div>
        </div>

        {/* 表示切替タブ */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              一覧
            </span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-pink-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              地図
            </span>
          </button>
        </div>

        {/* コンテンツ */}
        {viewMode === 'list' ? (
          <PharmacyList
            pharmacies={pharmacies}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="h-[60vh] min-h-[400px] bg-white rounded-xl shadow-sm overflow-hidden">
            <Map
              pharmacies={pharmacies}
              userLocation={userLocation}
              onPharmacyClick={handlePharmacyClick}
            />
          </div>
        )}

        {/* 詳細モーダル（地図から選択時） */}
        {selectedPharmacy && viewMode === 'map' && (
          <PharmacyDetail
            pharmacy={selectedPharmacy}
            onClose={() => setSelectedPharmacy(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
