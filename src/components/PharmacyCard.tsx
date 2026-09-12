import type { KeyboardEvent } from 'react';
import type { PharmacyWithDistance } from '../types/pharmacy';
import { formatDistance } from '../utils/distance';
import { formatTodayHours, isLikelyOpenNow } from '../utils/pharmacyAvailability';
import { toTelHref, formatPhoneDisplay } from '../utils/phone';
import { formatPharmacyAddress } from '../utils/formatAddress';

interface PharmacyCardProps {
  pharmacy: PharmacyWithDistance;
  onClick?: () => void;
  hasUserLocation?: boolean;
  activeMunicipality?: string;
}

export function PharmacyCard({
  pharmacy,
  onClick,
  hasUserLocation = false,
  activeMunicipality,
}: PharmacyCardProps) {
  const likelyOpen = isLikelyOpenNow(pharmacy.businessHours);
  const todayHours = formatTodayHours(pharmacy.businessHours);
  const closedToday = todayHours === '本日休み';
  const compactHours = todayHours.split('/')[0]?.trim() || todayHours;

  const openDetail = () => {
    onClick?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail();
    }
  };

  const hoursLabel = pharmacy.businessHours
    ? (likelyOpen ? `開局中 ${compactHours}` : compactHours)
    : (likelyOpen ? '開局中' : null);

  return (
    <article
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65BBE9]"
      onClick={openDetail}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center gap-2">
        <h3 className="min-w-0 flex-1 font-bold text-gray-900 text-[15px] leading-snug truncate scroll-mt-28 md:scroll-mt-44">
          {pharmacy.name}
        </h3>
        {pharmacy.distance !== undefined && (
          <span className="shrink-0 px-1.5 py-0.5 bg-[#EBF6FC] text-[#4AA8D9] text-xs font-medium rounded">
            {formatDistance(pharmacy.distance)}
          </span>
        )}
        {hasUserLocation && pharmacy.distance === undefined && (
          <span className="shrink-0 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded">
            距離未計測
          </span>
        )}
        <span className="shrink-0 text-gray-300 text-lg leading-none" aria-hidden="true">
          ›
        </span>
      </div>

      <p className="mt-0.5 text-gray-600 text-sm leading-snug truncate">
        {formatPharmacyAddress(pharmacy.address, pharmacy.prefecture, activeMunicipality)}
      </p>

      <div className="mt-1 flex flex-wrap gap-1.5">
        {hoursLabel && (
          <span className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded ${
            closedToday
              ? 'bg-gray-100 text-gray-600'
              : 'bg-[#EBF6FC] text-[#4AA8D9]'
          }`}>
            {hoursLabel}
          </span>
        )}
        {pharmacy.advanceCallRequired === '要' && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-amber-50 text-amber-700 rounded">
            要事前連絡
          </span>
        )}
        {pharmacy.pharmacistFemale !== undefined && pharmacy.pharmacistFemale > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-[#EBF6FC] text-[#4AA8D9] rounded">
            女性薬剤師
          </span>
        )}
      </div>

      {pharmacy.phone && (
        <a
          href={toTelHref(pharmacy.phone)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`電話する ${formatPhoneDisplay(pharmacy.phone)}`}
          className="mt-1.5 flex items-center justify-center gap-2 w-full px-3 py-1.5 text-white bg-[#65BBE9] rounded-lg hover:bg-[#4AA8D9] transition-colors"
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
