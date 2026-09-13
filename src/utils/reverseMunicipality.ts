import { MUNICIPALITY_BY_CODE } from '../data/municipalityCodes';

const GSI_REVERSE_URL = 'https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress';

interface GsiReverseResponse {
  results?: {
    muniCd?: string
    lv01Nm?: string
  }
}

/**
 * 国土地理院の逆ジオコーダで現在地の市区町村名を返す。
 * 位置情報は保存せず、市区の並び替えにだけ使う。
 */
export async function reverseMunicipality(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<string | null> {
  const url = `${GSI_REVERSE_URL}?lat=${lat}&lon=${lng}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as GsiReverseResponse;
  const code = data.results?.muniCd;
  if (!code) {
    return null;
  }

  const padded = String(code).padStart(5, '0');
  return MUNICIPALITY_BY_CODE[padded] ?? MUNICIPALITY_BY_CODE[String(Number(code))] ?? null;
}

export function matchKnownMunicipality(
  city: string,
  known: Record<string, number>,
): string | null {
  if (known[city]) {
    return city;
  }

  const prefixed = Object.keys(known).filter((name) => name.startsWith(city));
  if (prefixed.length === 1) {
    return prefixed[0];
  }

  return null;
}
