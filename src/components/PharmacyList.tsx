import { useState } from 'react';
import type { PharmacyWithDistance } from '../types/pharmacy';
import { PharmacyCard } from './PharmacyCard';
import { PharmacyDetail } from './PharmacyDetail';

interface PharmacyListProps {
  pharmacies: PharmacyWithDistance[];
  loading: boolean;
  error: string | null;
}

const ITEMS_PER_PAGE = 20;

export function PharmacyList({ pharmacies, loading, error }: PharmacyListProps) {
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyWithDistance | null>(null);

  const displayedPharmacies = pharmacies.slice(0, displayCount);
  const hasMore = displayCount < pharmacies.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="w-10 h-10 text-pink-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-4 text-gray-600">薬局データを読み込み中...</p>
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
        <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-gray-600">条件に一致する薬局が見つかりませんでした</p>
        <p className="mt-2 text-sm text-gray-500">検索条件を変更してお試しください</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-gray-600">
        {pharmacies.length}件の薬局が見つかりました
      </div>

      <div className="space-y-3">
        {displayedPharmacies.map((pharmacy) => (
          <PharmacyCard
            key={pharmacy.id}
            pharmacy={pharmacy}
            onClick={() => setSelectedPharmacy(pharmacy)}
          />
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
