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

  const city = stripped.match(/^([^\s\d]{1,12}市)/);
  if (city) {
    return city[1];
  }

  const ward = stripped.match(/^([^\s\d]{1,12}区)/);
  if (ward) {
    return ward[1];
  }

  const town = stripped.match(/^([^\s\d]{1,12}町)/);
  if (town) {
    return town[1];
  }

  const village = stripped.match(/^([^\s\d]{1,12}村)/);
  if (village) {
    return village[1];
  }

  return null;
}
