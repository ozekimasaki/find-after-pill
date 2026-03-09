import { useState } from 'react';
import type { PharmacyWithDistance } from '../types/pharmacy';
import { PharmacyCard } from './PharmacyCard';
import { PharmacyDetail } from './PharmacyDetail';

interface PharmacyListProps {
  pharmacies: PharmacyWithDistance[];
  loading: boolean;
  error: string | null;
  onResetFilters?: () => void;
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

export function PharmacyList({ pharmacies, loading, error, onResetFilters }: PharmacyListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);

  const displayedPharmacies = pharmacies.slice(0, displayCount);
  const hasMore = displayCount < pharmacies.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <div className="space-y-3">
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
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        {/* 虫眼鏡アイコン（ニュートラル） */}
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">条件に一致する薬局が見つかりませんでした</p>
        <p className="mt-2 text-sm text-gray-500">全国に多くの対応薬局があります。条件を変えて検索してみてください。</p>
        <ul className="mt-3 text-sm text-gray-500 space-y-1">
          <li>検索キーワードを短くしてみてください</li>
          <li>絞り込み条件を減らしてみてください</li>
        </ul>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 text-sm text-[#65BBE9] border border-[#65BBE9] rounded-lg hover:bg-[#EBF6FC] transition-colors"
          >
            フィルターをリセット
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {displayedPharmacies.map((pharmacy, index) => (
          <div
            key={pharmacy.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
          >
            <PharmacyCard
              pharmacy={pharmacy}
              onClick={() => setSelectedPharmacy(pharmacy)}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            もっと見る（残り{pharmacies.length - displayCount}件）
          </button>
        </div>
      )}

      {selectedPharmacy && (
        <PharmacyDetail
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}
    </>
  );
}
