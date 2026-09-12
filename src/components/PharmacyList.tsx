import { useState } from 'react';
import type { PharmacyWithDistance } from '../types/pharmacy';
import { PharmacyCard } from './PharmacyCard';
import { extractMunicipality } from '../utils/municipality';
import { shortMunicipalityLabel } from '../utils/municipalityRank';

interface PharmacyListEmptyActions {
  nextRadius?: number;
  onExpandRadius?: () => void;
  afterHoursOn?: boolean;
  onDisableAfterHours?: () => void;
  inferredPrefecture?: string | null;
  prefectureCount?: number;
  onShowPrefecture?: () => void;
  hasActiveFilters?: boolean;
}

interface PharmacyListProps {
  pharmacies: PharmacyWithDistance[];
  loading: boolean;
  error: string | null;
  onResetFilters?: () => void;
  onRetry?: () => void;
  onSelectPharmacy: (pharmacy: PharmacyWithDistance) => void;
  showUnmeasuredDistance?: boolean;
  groupByMunicipality?: boolean;
  preferredMunicipality?: string | null;
  activeMunicipality?: string;
  emptyActions?: PharmacyListEmptyActions;
}

const ITEMS_PER_PAGE = 20;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="flex justify-between items-start gap-2">
        <div className="h-5 bg-gray-200 rounded w-3/5" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="mt-3 h-4 bg-gray-200 rounded w-4/5" />
      <div className="mt-2 h-4 bg-gray-200 rounded w-1/3" />
      <div className="mt-3 flex gap-1.5">
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="h-5 bg-gray-200 rounded w-24" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

export function PharmacyList({
  pharmacies,
  loading,
  error,
  onResetFilters,
  onRetry,
  onSelectPharmacy,
  showUnmeasuredDistance = false,
  groupByMunicipality = false,
  preferredMunicipality = null,
  activeMunicipality,
  emptyActions,
}: PharmacyListProps) {
  const resultKey = `${pharmacies.length}:${pharmacies[0]?.id ?? ''}:${pharmacies[pharmacies.length - 1]?.id ?? ''}`;
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [seenKey, setSeenKey] = useState(resultKey);

  if (resultKey !== seenKey) {
    setSeenKey(resultKey);
    setDisplayCount(ITEMS_PER_PAGE);
  }

  const displayedPharmacies = pharmacies.slice(0, displayCount);
  const hasMore = displayCount < pharmacies.length;

  const loadMore = () => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700">{error}</p>
        <p className="mt-2 text-sm text-red-600">
          しばらく経ってから再度お試しください
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm text-white bg-[#65BBE9] rounded-lg hover:bg-[#4AA8D9] transition-colors"
          >
            再読み込み
          </button>
        )}
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">条件に一致する薬局が見つかりませんでした</p>
        <p className="mt-2 text-sm text-gray-500">条件を少し変えると見つかることが多いです。</p>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          {emptyActions?.nextRadius && emptyActions.onExpandRadius && (
            <button
              type="button"
              onClick={emptyActions.onExpandRadius}
              className="px-4 py-2 text-sm text-white bg-[#65BBE9] rounded-lg hover:bg-[#4AA8D9] transition-colors"
            >
              検索範囲を{emptyActions.nextRadius}kmに広げる
            </button>
          )}
          {emptyActions?.afterHoursOn && emptyActions.onDisableAfterHours && (
            <button
              type="button"
              onClick={emptyActions.onDisableAfterHours}
              className="px-4 py-2 text-sm text-[#4AA8D9] border border-[#65BBE9] rounded-lg hover:bg-[#EBF6FC] transition-colors"
            >
              夜間・休日の条件を外す
            </button>
          )}
          {emptyActions?.inferredPrefecture && emptyActions.onShowPrefecture && (
            <button
              type="button"
              onClick={emptyActions.onShowPrefecture}
              className="px-4 py-2 text-sm text-[#4AA8D9] border border-[#65BBE9] rounded-lg hover:bg-[#EBF6FC] transition-colors"
            >
              {emptyActions.inferredPrefecture}の薬局をすべて見る
              {emptyActions.prefectureCount
                ? `（${emptyActions.prefectureCount.toLocaleString()}件）`
                : ''}
            </button>
          )}
        </div>
        {onResetFilters && emptyActions?.hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            フィルターをリセット
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1.5">
        {displayedPharmacies.map((pharmacy, index) => {
          const city = groupByMunicipality
            ? (extractMunicipality(pharmacy.address, pharmacy.prefecture) ?? 'その他')
            : null;
          const previous = index > 0 ? displayedPharmacies[index - 1] : null;
          const previousCity = groupByMunicipality && previous
            ? (extractMunicipality(previous.address, previous.prefecture) ?? 'その他')
            : null;
          const showHeader = Boolean(city && city !== previousCity);

          return (
            <div
              key={pharmacy.id}
              className="animate-fadeIn scroll-mt-28 md:scroll-mt-44"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              {showHeader && (
                <p className="text-sm font-medium text-gray-500 px-1 pb-1.5 scroll-mt-28 md:scroll-mt-44">
                  {shortMunicipalityLabel(city ?? 'その他', preferredMunicipality)}
                  {preferredMunicipality === city ? ' · 現在地付近' : ''}
                </p>
              )}
              <PharmacyCard
                pharmacy={pharmacy}
                onClick={() => onSelectPharmacy(pharmacy)}
                hasUserLocation={showUnmeasuredDistance}
                activeMunicipality={activeMunicipality}
              />
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadMore}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            もっと見る（残り{pharmacies.length - displayCount}件）
          </button>
        </div>
      )}
    </>
  );
}
