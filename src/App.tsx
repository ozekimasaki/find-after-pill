import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import { PharmacyDetail } from './components/PharmacyDetail';
import { useGeolocation } from './hooks/useGeolocation';
import { usePharmacies } from './hooks/usePharmacies';
import { useDebounce } from './hooks/useDebounce';
import { isAfterHoursJst } from './utils/pharmacyAvailability';
import { inferPrefecture } from './utils/prefectureFromLocation';
import {
  DEFAULT_RADIUS,
  RADIUS_OPTIONS,
  parseUrlSearchState,
  replaceUrlSearchState,
  type ViewMode,
} from './utils/urlSearchState';
import type { PharmacyWithDistance } from './types/pharmacy';

const urlInit = typeof window === 'undefined'
  ? { searchParams: {}, viewMode: 'list' as const, radius: DEFAULT_RADIUS, hasExplicitHours: false }
  : parseUrlSearchState();

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>(urlInit.viewMode);
  const [radius, setRadius] = useState(urlInit.radius);
  const [queryInput, setQueryInput] = useState(urlInit.searchParams.query ?? '');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);
  const [hoursTouched, setHoursTouched] = useState(urlInit.hasExplicitHours);
  const [wasAutoEnabled, setWasAutoEnabled] = useState(
    !urlInit.hasExplicitHours && isAfterHoursJst()
  );

  const resultAreaRef = useRef<HTMLDivElement>(null);
  const prevLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const initialParamsRef = useRef(urlInit.searchParams);

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
    refetch,
    prefectureCounts,
  } = usePharmacies(userLocation, initialParamsRef.current);

  const debouncedQuery = useDebounce(queryInput, 300);

  useEffect(() => {
    const next = debouncedQuery.trim() || undefined;
    if (searchParams.query === next) {
      return;
    }
    setSearchParams({ query: next });
  }, [debouncedQuery, searchParams.query, setSearchParams]);

  const inferredPrefecture = useMemo(
    () => (userLocation ? inferPrefecture(userLocation.lat, userLocation.lng) : null),
    [userLocation]
  );

  const nextRadius = RADIUS_OPTIONS.find((option) => option > radius);
  const hasActiveFilters = Boolean(
    searchParams.query ||
    searchParams.prefecture ||
    searchParams.afterHoursOnly ||
    searchParams.noAdvanceCallRequired ||
    searchParams.femalePharmacistOnly ||
    searchParams.hasPrivateSpace
  );

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
    setRadius(DEFAULT_RADIUS);
  }, [clearLocationBase, setSearchParams]);

  const handleGetCurrentLocation = useCallback(() => {
    getCurrentLocation();
    setSearchParams({ radius });
  }, [getCurrentLocation, setSearchParams, radius]);

  const handleResetFilters = useCallback(() => {
    setQueryInput('');
    setSearchParams({
      query: undefined,
      prefecture: undefined,
      afterHoursOnly: false,
      noAdvanceCallRequired: false,
      femalePharmacistOnly: false,
      hasPrivateSpace: false,
    });
    setWasAutoEnabled(false);
    setHoursTouched(true);
  }, [setSearchParams]);

  const handleFilterChange: typeof setSearchParams = useCallback((params) => {
    if ('afterHoursOnly' in params) {
      setHoursTouched(true);
      if (!params.afterHoursOnly && wasAutoEnabled) {
        setWasAutoEnabled(false);
      }
    }
    setSearchParams(params);
  }, [setSearchParams, wasAutoEnabled]);

  const handleShowInferredPrefecture = useCallback(() => {
    if (!inferredPrefecture) {
      return;
    }
    setSearchParams({
      prefecture: inferredPrefecture,
      radius: undefined,
    });
  }, [inferredPrefecture, setSearchParams]);

  useEffect(() => {
    if (wasAutoEnabled) {
      setSearchParams({ afterHoursOnly: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    replaceUrlSearchState({
      searchParams,
      viewMode,
      hasLocation: !!userLocation,
      persistHoursOff: hoursTouched && !searchParams.afterHoursOnly,
    });
  }, [searchParams, viewMode, userLocation, hoursTouched]);

  useEffect(() => {
    if (prevLocationRef.current === null && userLocation !== null) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timer = window.setTimeout(() => {
        resultAreaRef.current?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }, 300);
      prevLocationRef.current = userLocation;
      return () => window.clearTimeout(timer);
    }
    prevLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!selectedPharmacy) {
      return;
    }
    const selectedId = selectedPharmacy.id;
    const fresh = pharmacies.find((pharmacy) => pharmacy.id === selectedId);
    if (fresh !== selectedPharmacy) {
      setSelectedPharmacy(fresh ?? null);
    }
  }, [pharmacies, selectedPharmacy]);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <a
        href="#results"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg"
      >
        検索結果へスキップ
      </a>
      <Header meta={meta} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <SupportBanner />

        <p className="text-sm text-gray-500 mb-3 px-1">
          処方箋なしで購入できます。まずはお近くの薬局を見つけましょう。
        </p>

        <h2 className="sr-only">薬局を検索</h2>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6" role="search">
          <div>
            <LocationButton
              onClick={handleGetCurrentLocation}
              loading={locationLoading}
              hasLocation={!!userLocation}
              onClear={handleClearLocation}
            />
            {locationError && (
              <p className="mt-2 text-sm text-red-600">{locationError}</p>
            )}
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchBar value={queryInput} onChange={setQueryInput} />
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
              setSearchParams={handleFilterChange}
            />
          </div>
        </div>

        {userLocation && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-medium text-gray-700">距離で絞り込み</span>
              {inferredPrefecture && (
                <span className="text-xs text-gray-400">
                  現在地は{inferredPrefecture}付近
                </span>
              )}
            </div>
            <div className="flex gap-1" role="group" aria-label="検索半径">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRadiusChange(r)}
                  aria-pressed={searchParams.radius === r}
                  className={`flex-1 py-1.5 text-sm font-medium rounded transition-colors ${
                    searchParams.radius === r
                      ? 'bg-[#65BBE9] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          id="results"
          ref={resultAreaRef}
          className="text-sm text-gray-600 mb-4 px-1 transition-opacity duration-200"
          aria-live="polite"
        >
          {loading ? (
            <span className="text-gray-400">お近くの薬局を探しています...</span>
          ) : userLocation && searchParams.radius ? (
            <span>
              {searchParams.radius}km以内に <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong> 件の薬局があります
            </span>
          ) : searchParams.prefecture ? (
            <span>
              {searchParams.prefecture} <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong> 件の対応薬局
            </span>
          ) : (
            <span>
              全国 <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong> 件の対応薬局
            </span>
          )}
        </div>

        {wasAutoEnabled && searchParams.afterHoursOnly && (
          <p className="text-xs text-gray-400 flex items-center gap-1 px-1 mb-2">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            現在の時間帯に基づいて「夜間・休日も対応」を自動で有効にしました
            <button
              type="button"
              onClick={() => handleFilterChange({ afterHoursOnly: false })}
              className="text-[#4AA8D9] hover:underline ml-1"
            >
              すべての薬局を見る
            </button>
          </p>
        )}

        {userLocation && pharmacies.length > 0 && pharmacies.length < 3 && inferredPrefecture && searchParams.radius && (
          <div className="mb-3 px-3 py-2 text-sm bg-[#EBF6FC] text-gray-700 rounded-lg">
            近くの地図登録は少なめです。
            <button
              type="button"
              onClick={handleShowInferredPrefecture}
              className="text-[#4AA8D9] hover:underline ml-1"
            >
              {inferredPrefecture}の薬局をすべて見る
              {prefectureCounts[inferredPrefecture]
                ? `（${prefectureCounts[inferredPrefecture].toLocaleString()}件）`
                : ''}
            </button>
          </div>
        )}

        <h2 className="sr-only">検索結果</h2>
        <nav aria-label="表示切替" className="flex gap-2 mb-4" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#65BBE9] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              一覧
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-[#65BBE9] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              地図
            </span>
          </button>
        </nav>

        {viewMode === 'list' ? (
          <PharmacyList
            pharmacies={pharmacies}
            loading={loading}
            error={error}
            onResetFilters={handleResetFilters}
            onRetry={refetch}
            onSelectPharmacy={setSelectedPharmacy}
            emptyActions={{
              nextRadius: userLocation ? nextRadius : undefined,
              onExpandRadius: nextRadius ? () => handleRadiusChange(nextRadius) : undefined,
              afterHoursOn: !!searchParams.afterHoursOnly,
              onDisableAfterHours: () => handleFilterChange({ afterHoursOnly: false }),
              inferredPrefecture,
              prefectureCount: inferredPrefecture ? prefectureCounts[inferredPrefecture] : undefined,
              onShowPrefecture: handleShowInferredPrefecture,
              hasActiveFilters,
            }}
          />
        ) : (
          <div className="h-[60vh] min-h-[400px] bg-white rounded-xl shadow-sm overflow-hidden">
            <Map
              pharmacies={pharmacies}
              userLocation={userLocation}
              onSelectPharmacy={setSelectedPharmacy}
            />
          </div>
        )}

        <FAQ />
      </main>

      <Footer />

      {selectedPharmacy && (
        <PharmacyDetail
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}

      <button
        type="button"
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
