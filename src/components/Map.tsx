import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { PharmacyWithDistance } from '../types/pharmacy';
import type { GeoLocation } from '../types/pharmacy';

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
      background: #ec4899;
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
  onPharmacyClick?: (pharmacy: PharmacyWithDistance) => void;
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

export function Map({ pharmacies, userLocation, onPharmacyClick }: MapProps) {
  // 座標のある薬局のみ
  const mappablePharmacies = pharmacies.filter(p => p.lat !== null && p.lng !== null);

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
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p>表示できる薬局がありません</p>
        </div>
      </div>
    );
  }

  return (
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

      {/* 現在地マーカー */}
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

      {/* 薬局マーカー */}
      {mappablePharmacies.map((pharmacy) => (
        <Marker
          key={pharmacy.id}
          position={[pharmacy.lat!, pharmacy.lng!]}
          icon={pharmacyIcon}
          eventHandlers={{
            click: () => onPharmacyClick?.(pharmacy),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-bold text-gray-900">{pharmacy.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
              {pharmacy.phone && (
                <p className="text-sm mt-1">
                  <a href={`tel:${pharmacy.phone}`} className="text-pink-600 hover:underline">
                    {pharmacy.phone}
                  </a>
                </p>
              )}
              {pharmacy.distance !== undefined && (
                <p className="text-sm text-pink-600 mt-1">
                  約 {pharmacy.distance.toFixed(1)}km
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
