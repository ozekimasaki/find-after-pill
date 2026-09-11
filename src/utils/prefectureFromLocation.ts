import { PREFECTURES, type Prefecture } from '../types/pharmacy';

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

  matches.sort((a, b) => area(a) - area(b));
  return matches[0].name;
}

export function isPrefecture(value: string): value is Prefecture {
  return (PREFECTURES as readonly string[]).includes(value);
}
