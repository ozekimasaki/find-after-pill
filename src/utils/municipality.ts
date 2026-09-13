/**
 * 政令市の区（大阪市北区）なら親の市名（大阪市）を返す。
 * 高槻市のような市は対象外。
 */
export function designatedCityName(name: string): string | null {
  const match = name.match(/^(.+?市)(?=.+区$)/);
  return match?.[1] ?? null;
}

export function municipalityMatches(city: string | null | undefined, filter: string): boolean {
  if (!city) {
    return false;
  }
  if (city === filter) {
    return true;
  }
  return designatedCityName(city) === filter;
}

export function isParentCityFilter(name: string, counts: Record<string, number>): boolean {
  return Object.keys(counts).some((city) => designatedCityName(city) === name);
}

export function shouldGroupPharmaciesByMunicipality(
  query: string | undefined,
  municipality: string | undefined | null,
  counts: Record<string, number>,
  inPrefectureBrowse: boolean,
): boolean {
  if (!inPrefectureBrowse || query) {
    return false;
  }
  if (!municipality) {
    return true;
  }
  return isParentCityFilter(municipality, counts);
}

/**
 * 都道府県一覧では政令市の区を市に畳む。市を選んだあとは区のまま。
 */
export function municipalityGroupKey(
  city: string | null | undefined,
  collapseParents: boolean,
): string {
  const name = city || 'その他';
  if (!collapseParents) {
    return name;
  }
  return designatedCityName(name) ?? name;
}

/**
 * 住所から市区町村（政令市は区まで）を取り出す。
 * 「東村山市」の「村」など、名前の途中の字を市区町村接尾辞と誤認しない。
 */
export function extractMunicipality(address: string, prefecture: string): string | null {
  const stripped = address
    .normalize('NFKC')
    .replace(prefecture, '')
    .replace(/^〒?\s*\d{3}-?\d{4}\s*/, '')
    .trim();

  if (!stripped) {
    return null;
  }

  const designated = stripped.match(/^([^\s\d]{1,10}市[^\s\d]{1,8}区)/);
  if (designated) {
    return designated[1];
  }

  const hasLeadingGun = /^[^\s\d]{1,8}郡/.test(stripped);
  if (!hasLeadingGun) {
    const city = stripped.match(/^([^\s\d]{1,12}市)/);
    if (city) {
      return city[1];
    }

    const ward = stripped.match(/^([^\s\d]{1,12}区)/);
    if (ward) {
      return ward[1];
    }
  }

  const town = stripped.match(/^((?:[^\s\d]{1,8}郡)?[^\s\d]{1,8}町)/);
  if (town) {
    return town[1];
  }

  const village = stripped.match(/^((?:[^\s\d]{1,8}郡)?[^\s\d]{1,8}村)/);
  if (village) {
    return village[1];
  }

  return null;
}
