import type { PharmacyWithDistance } from '../types/pharmacy';
import { formatDistance } from '../utils/distance';

interface PharmacyDetailProps {
  pharmacy: PharmacyWithDistance;
  onClose: () => void;
}

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <div className="text-gray-900 break-words">{value}</div>
      </div>
    </div>
  );
}

export function PharmacyDetail({ pharmacy, onClose }: PharmacyDetailProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.address)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(pharmacy.address)}`;

  // URLを正規化
  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">薬局詳細</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* 薬局名と距離 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-gray-900">{pharmacy.name}</h3>
            {pharmacy.distance !== undefined && (
              <span className="flex-shrink-0 px-3 py-1 bg-pink-100 text-pink-700 font-medium rounded-full">
                {formatDistance(pharmacy.distance)}
              </span>
            )}
          </div>

          {/* 基本情報 */}
          <div className="mt-4 space-y-3">
            {/* 住所 */}
            <DetailRow
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              label="住所"
              value={pharmacy.address}
            />

            {/* 電話番号 */}
            {pharmacy.phone && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                label="電話番号"
                value={
                  <a href={`tel:${pharmacy.phone}`} className="text-pink-600 hover:text-pink-700 hover:underline">
                    {pharmacy.phone}
                  </a>
                }
              />
            )}

            {/* 開局時間 */}
            {pharmacy.businessHours && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="開局時間"
                value={pharmacy.businessHours}
              />
            )}

            {/* 販売可能薬剤師 */}
            {(pharmacy.pharmacistFemale !== undefined || pharmacy.pharmacistMale !== undefined || pharmacy.pharmacistOther !== undefined) && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label="販売可能薬剤師"
                value={
                  <div className="flex flex-wrap gap-2">
                    {pharmacy.pharmacistFemale !== undefined && pharmacy.pharmacistFemale > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        女性 {pharmacy.pharmacistFemale}名
                      </span>
                    )}
                    {pharmacy.pharmacistMale !== undefined && pharmacy.pharmacistMale > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        男性 {pharmacy.pharmacistMale}名
                      </span>
                    )}
                    {pharmacy.pharmacistOther !== undefined && pharmacy.pharmacistOther > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        その他 {pharmacy.pharmacistOther}名
                      </span>
                    )}
                    {((pharmacy.pharmacistFemale || 0) + (pharmacy.pharmacistMale || 0) + (pharmacy.pharmacistOther || 0)) > 0 && (
                      <span className="text-gray-500 text-sm">
                        （計 {(pharmacy.pharmacistFemale || 0) + (pharmacy.pharmacistMale || 0) + (pharmacy.pharmacistOther || 0)}名）
                      </span>
                    )}
                  </div>
                }
              />
            )}

            {/* 時間外対応 */}
            {pharmacy.afterHoursService && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                }
                label="時間外対応"
                value={
                  <div>
                    <span>{pharmacy.afterHoursService}</span>
                    {pharmacy.afterHoursPhone && (
                      <div className="mt-1">
                        <span className="text-sm text-gray-500">時間外電話: </span>
                        <a href={`tel:${pharmacy.afterHoursPhone}`} className="text-pink-600 hover:underline">
                          {pharmacy.afterHoursPhone}
                        </a>
                      </div>
                    )}
                  </div>
                }
              />
            )}

            {/* 事前電話連絡 */}
            {pharmacy.advanceCallRequired && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                }
                label="事前電話連絡"
                value={pharmacy.advanceCallRequired}
              />
            )}

            {/* プライバシー確保策 */}
            {pharmacy.privacyMeasures && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                label="プライバシー確保策"
                value={pharmacy.privacyMeasures}
              />
            )}

            {/* ホームページ */}
            {pharmacy.website && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
                label="ホームページ"
                value={
                  <a
                    href={normalizeUrl(pharmacy.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 hover:underline break-all"
                  >
                    {pharmacy.website}
                  </a>
                }
              />
            )}

            {/* 備考 */}
            {pharmacy.notes && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="備考"
                value={pharmacy.notes}
              />
            )}

            {/* 薬局等番号 */}
            {pharmacy.pharmacyNumber && (
              <DetailRow
                icon={
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                }
                label="薬局等番号"
                value={<span className="text-gray-600 font-mono text-sm">{pharmacy.pharmacyNumber}</span>}
              />
            )}
          </div>

          {/* 注意事項 */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>ご注意：</strong>在庫状況や販売可能な薬剤師の勤務状況は変動します。
              訪問前に電話で確認することをお勧めします。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Google Maps
            </a>
            <a
              href={appleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Apple Maps
            </a>
          </div>

          {pharmacy.phone && (
            <a
              href={`tel:${pharmacy.phone}`}
              className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              電話で問い合わせる
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
