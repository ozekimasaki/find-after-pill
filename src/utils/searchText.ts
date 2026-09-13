/**
 * 検索用に文字列を正規化する（全角半角・カタカナ→ひらがな）。
 */
export function normalizeForSearch(value: string): string {
  return toHiragana(value.normalize('NFKC'))
    .toLowerCase()
    .replace(/[ーｰ・･\s]/g, '');
}

export function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, '');
}

function toHiragana(value: string): string {
  return value.replace(/[\u30A1-\u30F6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

interface SearchablePharmacy {
  name: string;
  address: string;
  prefecture: string;
  phone?: string;
  afterHoursPhone?: string;
  notes?: string;
}

/**
 * 薬局名・住所・都道府県・備考・電話番号でキーワードに一致するか。
 */
export function pharmacyMatchesQuery(
  pharmacy: SearchablePharmacy,
  query: string
): boolean {
  const trimmed = query.trim();
  if (!trimmed) {
    return true;
  }

  const normalizedQuery = normalizeForSearch(trimmed);
  if (normalizedQuery) {
    const haystack = normalizeForSearch(
      `${pharmacy.name} ${pharmacy.address} ${pharmacy.prefecture} ${pharmacy.notes ?? ''}`
    );
    if (haystack.includes(normalizedQuery)) {
      return true;
    }
  }

  const queryDigits = digitsOnly(trimmed);
  if (queryDigits.length >= 3) {
    const phone = digitsOnly(pharmacy.phone ?? '');
    const afterHours = digitsOnly(pharmacy.afterHoursPhone ?? '');
    if (phone.includes(queryDigits) || afterHours.includes(queryDigits)) {
      return true;
    }
  }

  return false;
}
