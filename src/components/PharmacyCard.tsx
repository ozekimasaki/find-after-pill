import type { PharmacyWithDistance } from '../types/pharmacy';
import { formatDistance } from '../utils/distance';

interface PharmacyCardProps {
  pharmacy: PharmacyWithDistance;
  onClick?: () => void;
}

export function PharmacyCard({ pharmacy, onClick }: PharmacyCardProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address)}`;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{pharmacy.name}</h3>
        {pharmacy.distance !== undefined && (
          <span className="flex-shrink-0 px-2 py-1 bg-[#EBF6FC] text-[#4AA8D9] text-sm font-medium rounded">
            {formatDistance(pharmacy.distance)}
          </span>
        )}
      </div>
      
      <p className="mt-2 text-gray-600 text-sm">{pharmacy.address}</p>
      
      {pharmacy.phone && (
        <p className="mt-1 text-gray-600 text-sm">
          <a
            href={`tel:${pharmacy.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-[#65BBE9] hover:text-[#4AA8D9] hover:underline"
          >
            {pharmacy.phone}
          </a>
        </p>
      )}

      {/* 追加情報バッジ */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pharmacy.businessHours && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pharmacy.businessHours.length > 20 ? pharmacy.businessHours.slice(0, 20) + '...' : pharmacy.businessHours}
          </span>
        )}
        {pharmacy.afterHoursService && pharmacy.afterHoursService !== 'なし' && pharmacy.afterHoursService !== '無' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            時間外対応あり
          </span>
        )}
        {pharmacy.pharmacistFemale !== undefined && pharmacy.pharmacistFemale > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#EBF6FC] text-[#4AA8D9] rounded">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            女性薬剤師 {pharmacy.pharmacistFemale}名
          </span>
        )}
        {pharmacy.privacyMeasures && pharmacy.privacyMeasures !== 'なし' && pharmacy.privacyMeasures !== '無' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            プライバシー配慮
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          地図で見る
        </a>
        {pharmacy.phone && (
          <a
            href={`tel:${pharmacy.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#65BBE9] rounded hover:bg-[#4AA8D9] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            電話する
          </a>
        )}
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors ml-auto"
        >
          詳細を見る
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
