import type { PharmacyWithDistance } from '../types/pharmacy';
import { formatDistance } from '../utils/distance';
import { formatTodayHours, hasAfterHoursSupport, isLikelyOpenNow } from '../utils/pharmacyAvailability';
import { toTelHref, formatPhoneDisplay } from '../utils/phone';
import { formatPharmacyAddress } from '../utils/formatAddress';

interface PharmacyCardProps {
  pharmacy: PharmacyWithDistance;
  onClick?: () => void;
  hasUserLocation?: boolean;
}

export function PharmacyCard({ pharmacy, onClick, hasUserLocation = false }: PharmacyCardProps) {
  const getGoogleMapsRouteUrl = () => {
    if (pharmacy.lat !== null && pharmacy.lng !== null) {
      return `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pharmacy.address)}`;
  };

  const googleMapsUrl = getGoogleMapsRouteUrl();
  const likelyOpen = isLikelyOpenNow(pharmacy.businessHours);
  const todayHours = formatTodayHours(pharmacy.businessHours);
  const closedToday = todayHours === '本日休み';

  return (
    <article
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3.5 hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-[#65BBE9]"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight scroll-mt-36 md:scroll-mt-44">{pharmacy.name}</h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {likelyOpen && (
            <span className="px-2 py-1 bg-[#EBF6FC] text-[#4AA8D9] text-xs font-medium rounded">
              開局中の目安
            </span>
          )}
          {pharmacy.distance !== undefined && (
            <span className="px-2 py-1 bg-[#EBF6FC] text-[#4AA8D9] text-sm font-medium rounded">
              {formatDistance(pharmacy.distance)}
            </span>
          )}
          {hasUserLocation && pharmacy.distance === undefined && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">
              距離未計測
            </span>
          )}
        </div>
      </div>

      <div className="mt-1.5 flex items-start justify-between gap-3">
        <p className="min-w-0 text-gray-600 text-sm break-words leading-snug">
          {formatPharmacyAddress(pharmacy.address)}
        </p>
        <div className="flex shrink-0 items-center gap-3 pt-0.5">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-[#4AA8D9] hover:underline"
          >
            ルート
          </a>
          <button
            type="button"
            onClick={onClick}
            className="text-sm text-[#4AA8D9] hover:underline"
          >
            詳細
          </button>
        </div>
      </div>

      {/* 追加情報バッジ */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pharmacy.businessHours && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${
            closedToday
              ? 'bg-gray-100 text-gray-600'
              : 'bg-[#EBF6FC] text-[#4AA8D9]'
          }`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {todayHours}
          </span>
        )}
        {hasAfterHoursSupport(pharmacy.afterHoursService) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#EBF6FC] text-[#4AA8D9] rounded">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            時間外対応あり
          </span>
        )}
        {pharmacy.advanceCallRequired === '要' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-amber-50 text-amber-700 rounded">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            要事前連絡
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

      {pharmacy.phone && (
        <a
          href={toTelHref(pharmacy.phone)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`電話する ${formatPhoneDisplay(pharmacy.phone)}`}
          className="mt-2 flex items-center justify-center gap-2 w-full px-3 py-2.5 text-white bg-[#65BBE9] rounded-lg hover:bg-[#4AA8D9] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm font-medium">電話する</span>
          <span className="text-sm tracking-wide">{formatPhoneDisplay(pharmacy.phone)}</span>
        </a>
      )}
    </article>
  );
}
