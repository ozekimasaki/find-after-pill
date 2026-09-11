import type { Pharmacy } from '../types/pharmacy';

function normalizeIdentity(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[‐‑‒–—―ー−]/g, '-')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function pharmacyDedupeKey(pharmacy: Pharmacy): string {
  return `${normalizeIdentity(pharmacy.name)}|${normalizeIdentity(pharmacy.address)}`;
}

function hasCoordinates(pharmacy: Pharmacy): boolean {
  return pharmacy.lat !== null && pharmacy.lng !== null;
}

/**
 * 名前・住所・電話が実質同じ薬局を1件にまとめる。
 * 座標がある方を残す。
 */
export function dedupePharmacies(pharmacies: Pharmacy[]): Pharmacy[] {
  const byKey = new Map<string, Pharmacy>();
  for (const pharmacy of pharmacies) {
    const key = pharmacyDedupeKey(pharmacy);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, pharmacy);
      continue;
    }
    if (!hasCoordinates(existing) && hasCoordinates(pharmacy)) {
      byKey.set(key, pharmacy);
    }
  }
  return [...byKey.values()];
}
