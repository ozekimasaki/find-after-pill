import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SupportBanner } from './components/SupportBanner';
import { SearchBar } from './components/SearchBar';
import { PrefectureFilter } from './components/PrefectureFilter';
import { LocationButton } from './components/LocationButton';
import { FilterPanel } from './components/FilterPanel';
import { PharmacyList } from './components/PharmacyList';
import { Map } from './components/Map';
import { FAQ } from './components/FAQ';
import { useGeolocation } from './hooks/useGeolocation';
import { usePharmacies } from './hooks/usePharmacies';

type ViewMode = 'list' | 'map';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [radius, setRadius] = useState(10);
  const [showOtherSearch, setShowOtherSearch] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const resultCountRef = useRef<HTMLDivElement>(null);
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearLocation: clearLocationBase,
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

  const handleRadiusChange = useCallback((r: number) => {
    setRadius(r);
    setSearchParams({ radius: r });
  }, [setSearchParams]);

  const handleClearLocation = useCallback(() => {
    clearLocationBase();
    setSearchParams({ radius: undefined });
    setRadius(10);
  }, [clearLocationBase, setSearchParams]);

  const handleGetCurrentLocation = useCallback(() => {
    getCurrentLocation();
    setSearchParams({ radius });
  }, [getCurrentLocation, setSearchParams, radius]);

  const handleResetFilters = useCallback(() => {
    setSearchParams({
      query: undefined,
      prefecture: undefined,
      afterHoursOnly: false,
      noAdvanceCallRequired: false,
      femalePharmacistOnly: false,
      hasPrivateSpace: false,
    });
  }, [setSearchParams]);

  // Auto-expand other search when filters/query are active
  const hasActiveFilters = !!(
    searchParams.query ||
    searchParams.prefecture ||
    searchParams.afterHoursOnly ||
    searchParams.noAdvanceCallRequired ||
    searchParams.femalePharmacistOnly ||
    searchParams.hasPrivateSpace
  );

  useEffect(() => {
    if (hasActiveFilters) {
      setShowOtherSearch(true);
    }
  }, [hasActiveFilters]);

  // Count active text/select filters for the toggle button
  const activeFilterCount = [
    searchParams.query,
    searchParams.prefecture,
    searchParams.afterHoursOnly,
    searchParams.noAdvanceCallRequired,
    searchParams.femalePharmacistOnly,
    searchParams.hasPrivateSpace,
  ].filter(Boolean).length;

  // Scroll to results when location is first obtained
  useEffect(() => {
    if (prevLocationRef.current === null && userLocation !== null) {
      setTimeout(() => {
        resultCountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    prevLocationRef.current = userLocation;
  }, [userLocation]);

  // Back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header meta={meta} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* サポートバナー */}
        <SupportBanner />

        {/* 共感メッセージ */}
        <p className="text-sm text-gray-500 mb-3 px-1">
          処方箋なしで購入できます。まずはお近くの薬局を見つけましょう。
        </p>

        {/* 検索フィルター */}
        <h2 className="sr-only">薬局を検索</h2>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6" role="search">
          {/* 位置検索を最上位に */}
          <div>
            <LocationButton
              onClick={handleGetCurrentLocation}
              loading={locationLoading}
              hasLocation={!!userLocation}
              onClear={handleClearLocation}
              radius={radius}
              onRadiusChange={handleRadiusChange}
            />
            {locationError && (
              <p className="mt-2 text-sm text-red-600">{locationError}</p>
            )}
          </div>

          {/* 「または」区切り線 */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* モバイルでは折りたたみトグル */}
          <button
            onClick={() => setShowOtherSearch(!showOtherSearch)}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-600 hover:text-gray-800 md:hidden"
          >
            <span className="flex items-center gap-2">
              薬局名・都道府県で探す
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-[#65BBE9] text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </span>
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${showOtherSearch ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 検索フォーム（モバイルでは折りたたみ、デスクトップでは常時表示） */}
          <div className={`overflow-hidden transition-all duration-300 ease-out md:max-h-none md:opacity-100 ${
            showOtherSearch ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 md:pt-0">
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
              <FilterPanel
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            </div>
          </div>
        </div>

        {/* 結果カウント */}
        <div
          ref={resultCountRef}
          className="text-sm text-gray-600 mb-4 px-1 transition-opacity duration-200"
          aria-live="polite"
        >
          {loading ? (
            <span className="text-gray-400">お近くの薬局を探しています...</span>
          ) : userLocation ? (
            <span>
              お近くに <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong> 件の薬局があります
            </span>
          ) : (
            <span>
              全国 <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong> 件の対応薬局
            </span>
          )}
        </div>

        {/* 表示切替タブ */}
        <h2 className="sr-only">検索結果</h2>
        <nav aria-label="表示切替" className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#65BBE9] text-white'
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
                ? 'bg-[#65BBE9] text-white'
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
        </nav>

        {/* コンテンツ */}
        {viewMode === 'list' ? (
          <PharmacyList
            pharmacies={pharmacies}
            loading={loading}
            error={error}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <div className="h-[60vh] min-h-[400px] bg-white rounded-xl shadow-sm overflow-hidden">
            <Map
              pharmacies={pharmacies}
              userLocation={userLocation}
            />
          </div>
        )}

        {/* FAQ */}
        <FAQ />
      </main>

      <Footer />

      {/* Back-to-top ボタン */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#65BBE9] hover:shadow-xl transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="ページの先頭に戻る"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

export default App;
