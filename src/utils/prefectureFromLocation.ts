import { PREFECTURES, type Prefecture } from '../types/pharmacy';

/** 都道府県庁付近。矩形が重なるときはここから近い県を選ぶ。 */
const PREFECTURE_CENTERS: Record<Prefecture, { lat: number; lng: number }> = {
  北海道: { lat: 43.064, lng: 141.347 },
  青森県: { lat: 40.825, lng: 140.741 },
  岩手県: { lat: 39.704, lng: 141.153 },
  宮城県: { lat: 38.269, lng: 140.872 },
  秋田県: { lat: 39.719, lng: 140.102 },
  山形県: { lat: 38.240, lng: 140.364 },
  福島県: { lat: 37.750, lng: 140.468 },
  茨城県: { lat: 36.342, lng: 140.447 },
  栃木県: { lat: 36.566, lng: 139.884 },
  群馬県: { lat: 36.391, lng: 139.060 },
  埼玉県: { lat: 35.857, lng: 139.649 },
  千葉県: { lat: 35.605, lng: 140.123 },
  東京都: { lat: 35.690, lng: 139.692 },
  神奈川県: { lat: 35.448, lng: 139.643 },
  新潟県: { lat: 37.902, lng: 139.023 },
  富山県: { lat: 36.695, lng: 137.211 },
  石川県: { lat: 36.595, lng: 136.626 },
  福井県: { lat: 36.065, lng: 136.222 },
  山梨県: { lat: 35.664, lng: 138.568 },
  長野県: { lat: 36.651, lng: 138.181 },
  岐阜県: { lat: 35.391, lng: 136.722 },
  静岡県: { lat: 34.977, lng: 138.383 },
  愛知県: { lat: 35.180, lng: 136.907 },
  三重県: { lat: 34.730, lng: 136.509 },
  滋賀県: { lat: 35.004, lng: 135.869 },
  京都府: { lat: 35.021, lng: 135.756 },
  大阪府: { lat: 34.686, lng: 135.520 },
  兵庫県: { lat: 34.691, lng: 135.183 },
  奈良県: { lat: 34.685, lng: 135.833 },
  和歌山県: { lat: 34.226, lng: 135.168 },
  鳥取県: { lat: 35.504, lng: 134.238 },
  島根県: { lat: 35.472, lng: 133.051 },
  岡山県: { lat: 34.662, lng: 133.935 },
  広島県: { lat: 34.396, lng: 132.459 },
  山口県: { lat: 34.186, lng: 131.471 },
  徳島県: { lat: 34.066, lng: 134.559 },
  香川県: { lat: 34.340, lng: 134.043 },
  愛媛県: { lat: 33.842, lng: 132.766 },
  高知県: { lat: 33.560, lng: 133.531 },
  福岡県: { lat: 33.607, lng: 130.418 },
  佐賀県: { lat: 33.249, lng: 130.299 },
  長崎県: { lat: 32.750, lng: 129.868 },
  熊本県: { lat: 32.790, lng: 130.742 },
  大分県: { lat: 33.238, lng: 131.613 },
  宮崎県: { lat: 31.911, lng: 131.424 },
  鹿児島県: { lat: 31.560, lng: 130.558 },
  沖縄県: { lat: 26.212, lng: 127.681 },
};

function distanceSquared(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number
): number {
  const dLat = lat - centerLat;
  const dLng = (lng - centerLng) * Math.cos(((lat + centerLat) / 2) * Math.PI / 180);
  return dLat * dLat + dLng * dLng;
}

interface PrefectureBounds {
  name: Prefecture;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * 都道府県の大まかな矩形。重なりがある場合は面積が小さい方を優先する。
 */
const PREFECTURE_BOUNDS: PrefectureBounds[] = [
  { name: '北海道', minLat: 41.3, maxLat: 45.6, minLng: 139.3, maxLng: 145.9 },
  { name: '青森県', minLat: 40.2, maxLat: 41.6, minLng: 139.4, maxLng: 141.8 },
  { name: '岩手県', minLat: 38.7, maxLat: 40.5, minLng: 140.6, maxLng: 142.1 },
  { name: '宮城県', minLat: 37.8, maxLat: 39.0, minLng: 140.3, maxLng: 141.7 },
  { name: '秋田県', minLat: 39.0, maxLat: 40.5, minLng: 139.5, maxLng: 141.0 },
  { name: '山形県', minLat: 37.7, maxLat: 39.2, minLng: 139.5, maxLng: 140.6 },
  { name: '福島県', minLat: 36.8, maxLat: 37.9, minLng: 139.2, maxLng: 141.0 },
  { name: '茨城県', minLat: 35.7, maxLat: 36.9, minLng: 139.7, maxLng: 140.9 },
  { name: '栃木県', minLat: 36.2, maxLat: 37.2, minLng: 139.4, maxLng: 140.3 },
  { name: '群馬県', minLat: 36.0, maxLat: 37.1, minLng: 138.4, maxLng: 139.6 },
  { name: '埼玉県', minLat: 35.7, maxLat: 36.3, minLng: 138.7, maxLng: 139.9 },
  { name: '千葉県', minLat: 34.9, maxLat: 36.0, minLng: 139.7, maxLng: 140.9 },
  { name: '東京都', minLat: 35.5, maxLat: 35.9, minLng: 139.0, maxLng: 139.95 },
  { name: '神奈川県', minLat: 35.1, maxLat: 35.7, minLng: 139.0, maxLng: 139.8 },
  { name: '新潟県', minLat: 37.0, maxLat: 38.6, minLng: 137.6, maxLng: 139.9 },
  { name: '富山県', minLat: 36.3, maxLat: 36.9, minLng: 136.7, maxLng: 137.8 },
  { name: '石川県', minLat: 36.1, maxLat: 37.5, minLng: 136.2, maxLng: 137.4 },
  { name: '福井県', minLat: 35.4, maxLat: 36.3, minLng: 135.4, maxLng: 136.8 },
  { name: '山梨県', minLat: 35.2, maxLat: 35.9, minLng: 138.2, maxLng: 139.1 },
  { name: '長野県', minLat: 35.2, maxLat: 37.0, minLng: 137.3, maxLng: 138.8 },
  { name: '岐阜県', minLat: 35.1, maxLat: 36.5, minLng: 136.3, maxLng: 137.7 },
  { name: '静岡県', minLat: 34.6, maxLat: 35.6, minLng: 137.4, maxLng: 139.2 },
  { name: '愛知県', minLat: 34.6, maxLat: 35.4, minLng: 136.6, maxLng: 137.8 },
  { name: '三重県', minLat: 33.7, maxLat: 35.2, minLng: 135.8, maxLng: 136.9 },
  { name: '滋賀県', minLat: 34.8, maxLat: 35.7, minLng: 135.8, maxLng: 136.5 },
  { name: '京都府', minLat: 34.7, maxLat: 35.8, minLng: 134.9, maxLng: 136.0 },
  { name: '大阪府', minLat: 34.3, maxLat: 35.0, minLng: 135.0, maxLng: 135.7 },
  { name: '兵庫県', minLat: 34.2, maxLat: 35.7, minLng: 134.3, maxLng: 135.5 },
  { name: '奈良県', minLat: 33.9, maxLat: 34.8, minLng: 135.6, maxLng: 136.2 },
  { name: '和歌山県', minLat: 33.4, maxLat: 34.4, minLng: 135.0, maxLng: 136.0 },
  { name: '鳥取県', minLat: 35.1, maxLat: 35.6, minLng: 133.1, maxLng: 134.5 },
  { name: '島根県', minLat: 34.3, maxLat: 36.3, minLng: 131.7, maxLng: 133.4 },
  { name: '岡山県', minLat: 34.4, maxLat: 35.3, minLng: 133.3, maxLng: 134.5 },
  { name: '広島県', minLat: 34.0, maxLat: 35.1, minLng: 132.2, maxLng: 133.3 },
  { name: '山口県', minLat: 33.7, maxLat: 34.8, minLng: 130.8, maxLng: 132.2 },
  { name: '徳島県', minLat: 33.7, maxLat: 34.3, minLng: 133.9, maxLng: 134.8 },
  { name: '香川県', minLat: 34.1, maxLat: 34.5, minLng: 133.5, maxLng: 134.5 },
  { name: '愛媛県', minLat: 32.9, maxLat: 34.1, minLng: 132.0, maxLng: 133.7 },
  { name: '高知県', minLat: 32.7, maxLat: 33.9, minLng: 132.5, maxLng: 134.3 },
  { name: '福岡県', minLat: 33.0, maxLat: 33.9, minLng: 130.0, maxLng: 131.2 },
  { name: '佐賀県', minLat: 33.0, maxLat: 33.6, minLng: 129.8, maxLng: 130.6 },
  { name: '長崎県', minLat: 32.5, maxLat: 34.7, minLng: 128.6, maxLng: 130.4 },
  { name: '熊本県', minLat: 32.0, maxLat: 33.2, minLng: 130.0, maxLng: 131.3 },
  { name: '大分県', minLat: 32.7, maxLat: 33.8, minLng: 130.8, maxLng: 132.2 },
  { name: '宮崎県', minLat: 31.4, maxLat: 32.9, minLng: 130.7, maxLng: 131.9 },
  { name: '鹿児島県', minLat: 27.0, maxLat: 32.3, minLng: 128.5, maxLng: 131.3 },
  { name: '沖縄県', minLat: 24.0, maxLat: 27.9, minLng: 122.9, maxLng: 131.3 },
];

function area(bounds: PrefectureBounds): number {
  return (bounds.maxLat - bounds.minLat) * (bounds.maxLng - bounds.minLng);
}

export function inferPrefecture(lat: number, lng: number): Prefecture | null {
  const matches = PREFECTURE_BOUNDS.filter(
    (bounds) =>
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lng >= bounds.minLng &&
      lng <= bounds.maxLng
  );

  if (matches.length === 0) {
    return null;
  }

  const names = new Set(matches.map((bounds) => bounds.name));
  if (names.has('東京都') && names.has('神奈川県')) {
    return lat >= 35.545 ? '東京都' : '神奈川県';
  }

  matches.sort((a, b) => {
    const centerA = PREFECTURE_CENTERS[a.name];
    const centerB = PREFECTURE_CENTERS[b.name];
    const byCenter =
      distanceSquared(lat, lng, centerA.lat, centerA.lng)
      - distanceSquared(lat, lng, centerB.lat, centerB.lng);
    if (byCenter !== 0) {
      return byCenter;
    }
    return area(a) - area(b);
  });
  return matches[0].name;
}

export function isPrefecture(value: string): value is Prefecture {
  return (PREFECTURES as readonly string[]).includes(value);
}
