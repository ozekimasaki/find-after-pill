/**
 * 住所から市区町村（政令市は区まで）を取り出す。
 */
export function extractMunicipality(address: string, prefecture: string): string | null {
  const stripped = address
    .normalize('NFKC')
    .replace(prefecture, '')
    .replace(/^〒?\s*\d{3}-?\d{4}\s*/, '')
    .trim();

  const designated = stripped.match(/^(.{1,10}?市.{1,8}?区)/);
  if (designated) {
    return designated[1];
  }

  const basic = stripped.match(/^(.{1,12}?[市区町村])/);
  return basic?.[1] ?? null;
}
