import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  Pharmacy, 
  PharmacyMeta, 
  PharmacyWithDistance, 
  SearchParams,
  GeoLocation 
} from '../types/pharmacy';
import { calculateDistance } from '../utils/distance';

interface UsePharmaciesReturn {
  pharmacies: PharmacyWithDistance[];
  meta: PharmacyMeta | null;
  loading: boolean;
  error: string | null;
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  refetch: () => void;
  prefectureCounts: Record<string, number>;
}

const API_BASE = '/api';

/**
 * 薬局データを取得・管理するカスタムフック
 */
export function usePharmacies(userLocation?: GeoLocation | null): UsePharmaciesReturn {
  const [allPharmacies, setAllPharmacies] = useState<Pharmacy[]>([]);
  const [meta, setMeta] = useState<PharmacyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParamsState] = useState<SearchParams>({});

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
      setAllPharmacies(data.pharmacies || []);
      setMeta(data.meta || null);
    } catch (err) {
      console.error('Failed to fetch pharmacies:', err);
      setError('薬局データの取得に失敗しました');
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
  const pharmacies = useMemo(() => {
    let filtered = [...allPharmacies];

    // 都道府県フィルター
    if (searchParams.prefecture) {
      filtered = filtered.filter(p => p.prefecture === searchParams.prefecture);
    }

    // フリーワード検索
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
      );
    }

    // 距離計算と位置フィルター
    const withDistance: PharmacyWithDistance[] = filtered.map(p => {
      if (userLocation && p.lat !== null && p.lng !== null) {
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

    // 半径フィルター
    let result = withDistance;
    if (userLocation && searchParams.radius) {
      result = withDistance.filter(p => 
        p.distance !== undefined && p.distance <= searchParams.radius!
      );
    }

    // ソート（距離がある場合は距離順、なければ都道府県→名前順）
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      });
    } else {
      result.sort((a, b) => {
        const prefCompare = a.prefecture.localeCompare(b.prefecture);
        if (prefCompare !== 0) return prefCompare;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [allPharmacies, searchParams, userLocation]);

  // 都道府県ごとの薬局数
  const prefectureCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allPharmacies) {
      counts[p.prefecture] = (counts[p.prefecture] || 0) + 1;
    }
    return counts;
  }, [allPharmacies]);

  return {
    pharmacies,
    meta,
    loading,
    error,
    searchParams,
    setSearchParams,
    refetch: fetchPharmacies,
    prefectureCounts,
  };
}
