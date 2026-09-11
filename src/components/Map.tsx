import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { PharmacyWithDistance } from '../types/pharmacy';
import type { GeoLocation } from '../types/pharmacy';
import { formatDistance } from '../utils/distance';
import { toTelHref } from '../utils/phone';

// Leafletのデフォルトアイコンを修正
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// カスタムアイコン（薬局用）
const pharmacyIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 現在地アイコン
const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #65BBE9;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapProps {
  pharmacies: PharmacyWithDistance[];
  userLocation?: GeoLocation | null;
  onSelectPharmacy?: (pharmacy: PharmacyWithDistance) => void;
}

// 地図の中心を更新するコンポーネント
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.setView(center, zoom);
      prevCenter.current = center;
    }
  }, [map, center, zoom]);

  return null;
}

const MAP_MARKER_LIMIT = 400;

// クラスタリングされたマーカーレイヤー
function MarkerLayer({
  pharmacies,
  onSelectPharmacy,
  userLocation,
}: {
  pharmacies: PharmacyWithDistance[];
  onSelectPharmacy?: (pharmacy: PharmacyWithDistance) => void;
  userLocation?: GeoLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });

    const bounded: L.LatLngExpression[] = [];

    pharmacies.forEach((p) => {
      if (p.lat === null || p.lng === null) return;
      bounded.push([p.lat, p.lng]);
      const marker = L.marker([p.lat, p.lng], { icon: pharmacyIcon });

      let popupContent = `<div style="min-width:200px"><h3 style="font-weight:bold;color:#111827;margin:0">${escapeHtml(p.name)}</h3>`;
      popupContent += `<p style="font-size:0.875rem;color:#4b5563;margin-top:4px">${escapeHtml(p.address)}</p>`;
      if (p.phone) {
        popupContent += `<p style="font-size:0.875rem;margin-top:4px"><a href="${toTelHref(p.phone)}" style="color:#65BBE9;text-decoration:none">${escapeHtml(p.phone)}</a></p>`;
      }
      if (p.distance !== undefined) {
        popupContent += `<p style="font-size:0.875rem;color:#65BBE9;margin-top:4px">${formatDistance(p.distance)}</p>`;
      }
      popupContent += `<p style="margin-top:8px"><button type="button" data-pharmacy-id="${escapeHtml(p.id)}" style="display:inline-flex;align-items:center;gap:4px;padding:6px 10px;background:#65BBE9;border:0;border-radius:6px;color:white;font-size:0.875rem;cursor:pointer">詳細を見る</button></p>`;
      popupContent += `</div>`;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.querySelector<HTMLButtonElement>(`button[data-pharmacy-id="${CSS.escape(p.id)}"]`);
        btn?.addEventListener('click', () => onSelectPharmacy?.(p));
      });
      cluster.addLayer(marker);
    });

    map.addLayer(cluster);

    if (bounded.length > 0) {
      const bounds = L.latLngBounds(bounded);
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng]);
      }
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: userLocation ? 14 : 11 });
    }

    return () => { map.removeLayer(cluster); };
  }, [pharmacies, map, onSelectPharmacy, userLocation]);

  return null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function Map({ pharmacies, userLocation, onSelectPharmacy }: MapProps) {
  // 座標のある薬局のみ
  const mappablePharmacies = pharmacies.filter(p => p.lat !== null && p.lng !== null);
  const limitedPharmacies = mappablePharmacies.slice(0, MAP_MARKER_LIMIT);
  const hiddenCount = mappablePharmacies.length - limitedPharmacies.length;

  // 地図の中心を決定
  const defaultCenter: [number, number] = [35.6812, 139.7671]; // 東京
  let center: [number, number] = defaultCenter;
  let zoom = 6;

  if (userLocation) {
    center = [userLocation.lat, userLocation.lng];
    zoom = 13;
  } else if (mappablePharmacies.length > 0) {
    // 最初の薬局を中心に
    center = [mappablePharmacies[0].lat!, mappablePharmacies[0].lng!];
    zoom = 10;
  }

  if (mappablePharmacies.length === 0 && !userLocation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg px-6">
        <div className="text-center text-gray-600 max-w-sm">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="font-medium text-gray-700">地図に表示できる位置情報がありません</p>
          {pharmacies.length > 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              一覧には{pharmacies.length.toLocaleString()}件ありますが、地図座標が未登録です。一覧タブから電話やルートを確認できます。
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">条件を変えるか、一覧タブから探してみてください。</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {hiddenCount > 0 && (
        <p className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 text-xs bg-white/95 text-gray-600 rounded-full shadow-sm">
          地図には{MAP_MARKER_LIMIT}件まで表示しています。都道府県や距離で絞り込むと見やすくなります
        </p>
      )}
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} zoom={zoom} />

      {/* 現在地マーカー（クラスター外） */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
        >
          <Popup>
            <div className="text-center">
              <strong>現在地</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {/* 薬局マーカー（クラスタリング） */}
      <MarkerLayer
        pharmacies={limitedPharmacies}
        onSelectPharmacy={onSelectPharmacy}
        userLocation={userLocation}
      />
    </MapContainer>
    </div>
  );
}
