import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Pharmacy,
  PharmacyMeta,
  PharmacyWithDistance,
  SearchParams,
  GeoLocation
} from '../types/pharmacy';
import { PREFECTURES } from '../types/pharmacy';
import { calculateDistance } from '../utils/distance';
import { inferPrefecture } from '../utils/prefectureFromLocation';
import { isLikelyInJapan } from '../utils/japanBounds';
import { isLikelyOpenNow, supportsAfterHoursFilter } from '../utils/pharmacyAvailability';
import { pharmacyMatchesQuery } from '../utils/searchText';
import { extractMunicipality } from '../utils/municipality';
import { compareMunicipalityNames } from '../utils/municipalityRank';
import { matchKnownMunicipality } from '../utils/reverseMunicipality';
import { dedupePharmacies } from '../utils/pharmacyIdentity';

export type LocationFallback = 'none' | 'ungeocoded' | 'prefecture';

export interface LocationSearchInfo {
  nearbyCount: number;
  fallback: LocationFallback;
  prefecture: string | null;
  nearbyPrefectures: string[];
}

interface UsePharmaciesReturn {
  pharmacies: PharmacyWithDistance[];
  meta: PharmacyMeta | null;
  loading: boolean;
  error: string | null;
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  refetch: () => void;
  prefectureCounts: Record<string, number>;
  locationSearch: LocationSearchInfo;
  loadedCount: number;
  municipalityCounts: Record<string, number>;
}

const API_BASE = '/api';

function prefectureSortIndex(prefecture: string): number {
  const index = (PREFECTURES as readonly string[]).indexOf(prefecture);
  return index === -1 ? PREFECTURES.length : index;
}

/**
 * 薬局データを取得・管理するカスタムフック
 */
export function usePharmacies(
  userLocation?: GeoLocation | null,
  initialParams: SearchParams = {},
  preferredMunicipality?: string | null,
): UsePharmaciesReturn {
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  const [meta, setMeta] = useState<PharmacyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParamsState] = useState<SearchParams>(initialParams);

  // データ取得
  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/pharmacies`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setAllPharmacies(dedupePharmacies(data.pharmacies || []));
      setMeta(data.meta || null);
    } catch (err) {
      console.error('Failed to fetch pharmacies:', err);
      setError('薬局データの取得に失敗しました。通信状況を確認して再度お試しください');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  // 検索パラメータを更新
  const setSearchParams = useCallback((params: Partial<SearchParams>) => {
    setSearchParamsState(prev => ({ ...prev, ...params }));
  }, []);

  // フィルタリング・ソート済みの薬局リスト
  const { pharmacies, locationSearch } = useMemo(() => {
    let filtered = [...allPharmacies];
    const skipPrefectureFilter = Boolean(
      userLocation && searchParams.radius && searchParams.prefectureIsHint
    );

    // 現在地の近傍検索中は、推測した都道府県で他県を落とさない
    if (searchParams.prefecture && !skipPrefectureFilter) {
      filtered = filtered.filter(p => p.prefecture === searchParams.prefecture);
    }

    // フリーワード検索（ひらがな/カタカナ・電話番号も対象）
    if (searchParams.query) {
      filtered = filtered.filter((p) => pharmacyMatchesQuery(p, searchParams.query!));
    }

    // 追加フィルター
    if (searchParams.afterHoursOnly) {
      filtered = filtered.filter(supportsAfterHoursFilter);
    }
    if (searchParams.noAdvanceCallRequired) {
      filtered = filtered.filter(p =>
        !p.advanceCallRequired || p.advanceCallRequired !== '要'
      );
    }
    if (searchParams.femalePharmacistOnly) {
      filtered = filtered.filter(p =>
        p.pharmacistFemale !== undefined && p.pharmacistFemale > 0
      );
    }
    if (searchParams.hasPrivateSpace) {
      filtered = filtered.filter(p =>
        p.privacyMeasures && p.privacyMeasures.includes('個室')
      );
    }
    if (searchParams.openNowOnly) {
      filtered = filtered.filter((p) => isLikelyOpenNow(p.businessHours));
    }

    const inferredPrefecture = userLocation
      ? inferPrefecture(userLocation.lat, userLocation.lng)
      : null;
    const fallbackPrefecture = searchParams.prefecture || inferredPrefecture;

    const withDistance: PharmacyWithDistance[] = filtered.map(p => {
      if (
        userLocation &&
        p.lat !== null &&
        p.lng !== null &&
        isLikelyInJapan(p.lat, p.lng)
      ) {
        return {
          ...p,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            p.lat,
            p.lng
          ),
        };
      }
      return { ...p, distance: undefined };
    });

    let result = withDistance;
    let nearbyCount = 0;
    let fallback: LocationFallback = 'none';
    let nearbyPrefectures: string[] = [];

    if (userLocation && searchParams.radius) {
      const nearby = withDistance.filter(p =>
        p.distance !== undefined && p.distance <= searchParams.radius!
      );
      nearbyCount = nearby.length;
      nearbyPrefectures = [...new Set(nearby.map((pharmacy) => pharmacy.prefecture))]
        .sort((a, b) => prefectureSortIndex(a) - prefectureSortIndex(b));

      if (nearby.length === 0 && fallbackPrefecture) {
        result = withDistance.filter(p => p.prefecture === fallbackPrefecture);
        fallback = result.length > 0 ? 'prefecture' : 'none';
      } else {
        const ungeocoded = fallbackPrefecture
          ? withDistance.filter(p =>
            p.distance === undefined && p.prefecture === fallbackPrefecture
          )
          : [];
        result = nearby.concat(ungeocoded);
        fallback = ungeocoded.length > 0 ? 'ungeocoded' : 'none';
      }
    } else {
      nearbyCount = withDistance.filter(p => p.distance !== undefined).length;
    }

    const openIds = new Set(
      result.filter(p => isLikelyOpenNow(p.businessHours)).map(p => p.id)
    );

    const compareOpenThenName = (a: PharmacyWithDistance, b: PharmacyWithDistance) => {
      const aOpen = openIds.has(a.id);
      const bOpen = openIds.has(b.id);
      if (aOpen !== bOpen) {
        return aOpen ? -1 : 1;
      }
      return a.name.localeCompare(b.name, 'ja');
    };

    const groupByMunicipality = Boolean(
      !searchParams.query && (
        fallback === 'prefecture' || (!userLocation && !!searchParams.prefecture)
      )
    );

    if (userLocation && !groupByMunicipality) {
      result.sort((a, b) => {
        const aHas = a.distance !== undefined;
        const bHas = b.distance !== undefined;
        if (aHas && bHas) {
          const delta = a.distance! - b.distance!;
          if (Math.abs(delta) >= 0.05) {
            return delta;
          }
        } else if (aHas !== bHas) {
          return aHas ? -1 : 1;
        }
        return compareOpenThenName(a, b);
      });
    } else if (groupByMunicipality) {
      const cityCounts: Record<string, number> = {};
      for (const pharmacy of result) {
        const city = extractMunicipality(pharmacy.address, pharmacy.prefecture) ?? 'その他';
        cityCounts[city] = (cityCounts[city] || 0) + 1;
      }
      const preferredCity = preferredMunicipality
        ? matchKnownMunicipality(preferredMunicipality, cityCounts)
        : null;
      result.sort((a, b) => {
        const cityA = extractMunicipality(a.address, a.prefecture) ?? 'その他';
        const cityB = extractMunicipality(b.address, b.prefecture) ?? 'その他';
        const cityDelta = compareMunicipalityNames(cityA, cityB, preferredCity, cityCounts);
        if (cityDelta !== 0) {
          return cityDelta;
        }
        return compareOpenThenName(a, b);
      });
    } else {
      result.sort((a, b) => {
        const prefDelta = prefectureSortIndex(a.prefecture) - prefectureSortIndex(b.prefecture);
        if (prefDelta !== 0) {
          return prefDelta;
        }
        return a.name.localeCompare(b.name, 'ja');
      });
    }

    return {
      pharmacies: result,
      locationSearch: {
        nearbyCount,
        fallback,
        prefecture: fallbackPrefecture,
        nearbyPrefectures,
      },
    };
  }, [allPharmacies, searchParams, userLocation, preferredMunicipality]);

  // 都道府県ごとの薬局数
  const prefectureCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allPharmacies) {
      counts[p.prefecture] = (counts[p.prefecture] || 0) + 1;
    }
    return counts;
  }, [allPharmacies]);

  const municipalityCounts = useMemo(() => {
    const targetPref = searchParams.prefecture
      || (userLocation ? inferPrefecture(userLocation.lat, userLocation.lng) : null);
    if (!targetPref) {
      return {};
    }
    const counts: Record<string, number> = {};
    for (const pharmacy of allPharmacies) {
      if (pharmacy.prefecture !== targetPref) {
        continue;
      }
      const city = extractMunicipality(pharmacy.address, pharmacy.prefecture);
      if (city) {
        counts[city] = (counts[city] || 0) + 1;
      }
    }
    return counts;
  }, [allPharmacies, searchParams.prefecture, userLocation]);

  return {
    pharmacies,
    meta,
    loading,
    error,
    searchParams,
    setSearchParams,
    refetch: fetchPharmacies,
    prefectureCounts,
    locationSearch,
    loadedCount: allPharmacies.length,
    municipalityCounts,
  };
}
