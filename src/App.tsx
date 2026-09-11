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
import { MunicipalityChips } from './components/MunicipalityChips';
import { FilterToggleButton } from './components/FilterToggleButton';
import { useGeolocation } from './hooks/useGeolocation';
import { usePharmacies } from './hooks/usePharmacies';
import { useReverseMunicipality } from './hooks/useReverseMunicipality';
import { useDebounce } from './hooks/useDebounce';
import { isAfterHoursJst } from './utils/pharmacyAvailability';
import { inferPrefecture } from './utils/prefectureFromLocation';
import { matchKnownMunicipality } from './utils/reverseMunicipality';
import { shortMunicipalityLabel } from './utils/municipalityRank';
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
  const [scrolled, setScrolled] = useState(false);
  const [filtersPinned, setFiltersPinned] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);
  const [hoursTouched, setHoursTouched] = useState(urlInit.hasExplicitHours);
  const [wasAutoEnabled, setWasAutoEnabled] = useState(
    !urlInit.hasExplicitHours && isAfterHoursJst()
  );

  const resultAreaRef = useRef<HTMLDivElement>(null);
  const initialParamsRef = useRef(urlInit.searchParams);
  const userFilterRef = useRef(false);
  const autoPrefRef = useRef<string | null>(null);
  const autoPrefClearedRef = useRef(false);

  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearLocation: clearLocationBase,
  } = useGeolocation();

  const inferredMunicipalityState = useReverseMunicipality(userLocation);
  const inferredMunicipality = inferredMunicipalityState.city;

  const {
    pharmacies,
    meta,
    loading,
    error,
    searchParams,
    setSearchParams,
    refetch,
    prefectureCounts,
    locationSearch,
    loadedCount,
    municipalityCounts,
  } = usePharmacies(userLocation, initialParamsRef.current, inferredMunicipality);

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

  useEffect(() => {
    if (!userLocation || !inferredPrefecture) {
      return;
    }
    if (searchParams.prefecture || autoPrefClearedRef.current) {
      return;
    }
    autoPrefRef.current = inferredPrefecture;
    setSearchParams({ prefecture: inferredPrefecture, prefectureIsHint: true });
  }, [userLocation, inferredPrefecture, searchParams.prefecture, setSearchParams]);

  const preferredCity = inferredMunicipality
    ? matchKnownMunicipality(inferredMunicipality, municipalityCounts)
    : null;
  const cityQuery = searchParams.query && municipalityCounts[searchParams.query]
    ? searchParams.query
    : undefined;
  const locationLabel = preferredCity
    ? shortMunicipalityLabel(preferredCity, preferredCity)
    : inferredPrefecture;
  const extraFilterCount = [
    searchParams.openNowOnly,
    searchParams.afterHoursOnly,
    searchParams.noAdvanceCallRequired,
    searchParams.femalePharmacistOnly,
    searchParams.hasPrivateSpace,
  ].filter(Boolean).length;
  const extrasOpen = filtersPinned || (!scrolled && !userLocation);
  const nextRadius = RADIUS_OPTIONS.find((option) => option > radius);
  const hasActiveFilters = Boolean(
    searchParams.query ||
    searchParams.prefecture ||
    searchParams.afterHoursOnly ||
    searchParams.noAdvanceCallRequired ||
    searchParams.femalePharmacistOnly ||
    searchParams.hasPrivateSpace ||
    searchParams.openNowOnly
  );

  const handlePrefectureChange = useCallback((prefecture: string) => {
    userFilterRef.current = true;
    autoPrefRef.current = null;
    autoPrefClearedRef.current = !prefecture;
    setSearchParams({ prefecture: prefecture || undefined, prefectureIsHint: false });
  }, [setSearchParams]);

  const handleRadiusChange = useCallback((r: number) => {
    userFilterRef.current = true;
    setRadius(r);
    setSearchParams({ radius: r });
  }, [setSearchParams]);

  const handleClearLocation = useCallback(() => {
    clearLocationBase();
    const clearAutoPref = autoPrefRef.current && searchParams.prefecture === autoPrefRef.current;
    autoPrefRef.current = null;
    autoPrefClearedRef.current = false;
    setSearchParams({
      radius: undefined,
      prefecture: clearAutoPref ? undefined : searchParams.prefecture,
      prefectureIsHint: false,
    });
    setRadius(DEFAULT_RADIUS);
  }, [clearLocationBase, setSearchParams, searchParams.prefecture]);

  const handleGetCurrentLocation = useCallback(() => {
    autoPrefClearedRef.current = false;
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
      openNowOnly: false,
      prefectureIsHint: false,
    });
    setWasAutoEnabled(false);
    setHoursTouched(true);
  }, [setSearchParams]);

  const handleFilterChange: typeof setSearchParams = useCallback((params) => {
    userFilterRef.current = true;
    if ('afterHoursOnly' in params) {
      setHoursTouched(true);
      if (!params.afterHoursOnly && wasAutoEnabled) {
        setWasAutoEnabled(false);
      }
    }
    setSearchParams(params);
  }, [setSearchParams, wasAutoEnabled]);

  const handleMunicipalitySelect = useCallback((city: string) => {
    const next = queryInput === city ? '' : city;
    setQueryInput(next);
    setSearchParams({ query: next || undefined });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultAreaRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [queryInput, setSearchParams]);

  const handleShowInferredPrefecture = useCallback(() => {
    if (!inferredPrefecture) {
      return;
    }
    setSearchParams({
      prefecture: inferredPrefecture,
      radius: undefined,
      prefectureIsHint: false,
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
    const handleScroll = () => {
      const y = window.scrollY;
      setShowBackToTop(y > 400);
      setScrolled(y > 80);
      if (y > 80) {
        setFiltersPinned(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!userFilterRef.current) {
      return;
    }
    userFilterRef.current = false;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultAreaRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [
    searchParams.prefecture,
    searchParams.afterHoursOnly,
    searchParams.noAdvanceCallRequired,
    searchParams.femalePharmacistOnly,
    searchParams.hasPrivateSpace,
    searchParams.openNowOnly,
    searchParams.radius,
  ]);

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
      <Header meta={meta} loadedCount={loadedCount} compact={!!userLocation} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 sm:py-6">
        {!userLocation && <SupportBanner />}

        {!userLocation && (
          <p className="text-sm text-gray-500 mb-3 px-1">
            処方箋なしで購入できます。まずはお近くの薬局を見つけましょう。
          </p>
        )}

        <h2 className="sr-only">薬局を検索</h2>
        {(!userLocation || locationLoading || locationError) && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
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
        )}

        <div
          role="search"
          className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm -mx-4 px-4 py-1.5 mb-3 border-b border-gray-100"
        >
            <div className="bg-white rounded-xl shadow-sm p-2 md:p-3">
              {userLocation && (
                <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-gray-500">
                  <span className="shrink-0">
                    現在地{locationLabel ? `（${locationLabel}）` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="text-[#4AA8D9] hover:underline shrink-0"
                  >
                    解除
                  </button>
                  <div
                    className={`ml-auto min-w-0 gap-0.5 ${extrasOpen ? 'hidden' : 'flex'} md:hidden`}
                    role="group"
                    aria-label="検索半径"
                  >
                    {RADIUS_OPTIONS.filter((r) => r === 5 || r === 10 || r === 20 || r === searchParams.radius).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRadiusChange(r)}
                        aria-pressed={searchParams.radius === r}
                        aria-label={`${r}km`}
                        className={`px-1.5 py-0.5 rounded font-medium ${
                          searchParams.radius === r
                            ? 'bg-[#65BBE9] text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {r}km
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 md:grid md:grid-cols-3 md:gap-3 items-center">
                <div className="min-w-0 flex-1 md:col-span-2">
                  <SearchBar value={queryInput} onChange={setQueryInput} />
                </div>
                {userLocation && (
                  <FilterToggleButton
                    open={extrasOpen}
                    count={extraFilterCount}
                    onClick={() => setFiltersPinned((current) => !current)}
                  />
                )}
                <div className={`w-[9.25rem] shrink-0 md:w-auto ${userLocation ? 'hidden md:block' : ''}`}>
                  <PrefectureFilter
                    value={searchParams.prefecture || ''}
                    onChange={handlePrefectureChange}
                    counts={prefectureCounts}
                  />
                </div>
              </div>
              <div className={extrasOpen ? 'block' : 'hidden md:block'}>
              {userLocation && extrasOpen && (
                <div className="mt-2 md:hidden">
                  <PrefectureFilter
                    selectId="prefecture-select-extra"
                    value={searchParams.prefecture || ''}
                    onChange={handlePrefectureChange}
                    counts={prefectureCounts}
                  />
                </div>
              )}
              <div className="mt-2 md:mt-3">
                <FilterPanel
                  searchParams={searchParams}
                  setSearchParams={handleFilterChange}
                />
              </div>
              {userLocation && (
                <div className="mt-2 md:mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">距離</span>
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
                        className={`flex-1 py-1 text-xs md:text-sm font-medium rounded transition-colors ${
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
              </div>
            </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
        <div
          id="results"
          ref={resultAreaRef}
          className="min-w-0 flex-1 text-sm text-gray-600 transition-opacity duration-200 scroll-mt-32 md:scroll-mt-44"
          aria-live="polite"
        >
          {loading ? (
            <span className="text-gray-400">お近くの薬局を探しています...</span>
          ) : cityQuery ? (
            <span>
              <strong className="text-gray-900">{cityQuery}</strong>
              {' '}<strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong>件
            </span>
          ) : userLocation && searchParams.radius && locationSearch.fallback === 'prefecture' && locationSearch.prefecture ? (
            <span>
              <strong className="text-gray-900">{locationSearch.prefecture}</strong>
              {' '}<strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong>件
              {preferredCity ? (
                <span className="text-gray-400"> · {shortMunicipalityLabel(preferredCity, preferredCity)}を先頭に</span>
              ) : null}
            </span>
          ) : userLocation && searchParams.radius && locationSearch.fallback === 'ungeocoded' ? (
            <span>
              {searchParams.radius}km以内 <strong className="text-gray-900">{locationSearch.nearbyCount.toLocaleString()}</strong>件
              {locationSearch.prefecture
                ? ` · ほか${locationSearch.prefecture}の未登録あり`
                : ''}
            </span>
          ) : userLocation && searchParams.radius ? (
            <span>
              {searchParams.radius}km以内 <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong>件
              {locationSearch.nearbyPrefectures.length > 1
                ? `（${locationSearch.nearbyPrefectures.join('・')}）`
                : ''}
            </span>
          ) : searchParams.prefecture ? (
            <span>
              {searchParams.prefecture} <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong>件
            </span>
          ) : (
            <span>
              全国 <strong className="text-gray-900">{pharmacies.length.toLocaleString()}</strong>件
            </span>
          )}
        </div>
        <nav aria-label="表示切替" className="shrink-0 flex rounded-lg bg-white p-0.5 shadow-sm" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-md font-medium text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-[#65BBE9] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            一覧
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            onClick={() => setViewMode('map')}
            className={`px-2.5 py-1 rounded-md font-medium text-sm transition-colors ${
              viewMode === 'map'
                ? 'bg-[#65BBE9] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            地図
          </button>
        </nav>
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

        {userLocation && pharmacies.length > 0 && pharmacies.length < 3 && inferredPrefecture && searchParams.radius && locationSearch.fallback === 'none' && (
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

        {viewMode === 'list'
          && (searchParams.prefecture || userLocation)
          && (!userLocation || inferredMunicipalityState.ready) && (
          <MunicipalityChips
            counts={municipalityCounts}
            selected={queryInput}
            preferred={preferredCity}
            onSelect={handleMunicipalitySelect}
          />
        )}

        <h2 className="sr-only">検索結果</h2>
        {viewMode === 'list' ? (
          <PharmacyList
            pharmacies={pharmacies}
            loading={loading}
            error={error}
            onResetFilters={handleResetFilters}
            onRetry={refetch}
            onSelectPharmacy={setSelectedPharmacy}
            groupByMunicipality={
              !searchParams.query && (
                locationSearch.fallback === 'prefecture'
                || (!userLocation && !!searchParams.prefecture)
              )
            }
            preferredMunicipality={preferredCity}
            showUnmeasuredDistance={
              !!userLocation && pharmacies.some((pharmacy) => pharmacy.distance !== undefined)
            }
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
              onShowList={() => setViewMode('list')}
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
