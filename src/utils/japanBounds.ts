/**
 * 日本列島の大まかな範囲。明らかな海外座標を地図・距離計算から除外する。
 */
export function isLikelyInJapan(lat: number, lng: number): boolean {
  return lat >= 20 && lat <= 46.5 && lng >= 122 && lng <= 154;
}
