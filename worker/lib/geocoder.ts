import type { Pharmacy } from '../../src/types/pharmacy';
import type { Env } from '../types';
import { KV_KEYS } from '../types';

/**
 * 国土地理院のジオコーディングAPI
 * https://msearch.gsi.go.jp/address-search/AddressSearch
 */
const GSI_GEOCODE_API = 'https://msearch.gsi.go.jp/address-search/AddressSearch';

interface GsiGeocodeResult {
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    title: string;
  };
}

/**
 * 住所から緯度経度を取得（国土地理院API）
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // 住所を正規化（番地以降を削除して検索精度を上げる）
    const normalizedAddress = normalizeAddress(address);
    
    const url = `${GSI_GEOCODE_API}?q=${encodeURIComponent(normalizedAddress)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NorlevoPortal/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`Geocode API error for "${address}": ${response.status}`);
      return null;
    }

    const results: GsiGeocodeResult[] = await response.json();
    
    if (results && results.length > 0) {
      const [lng, lat] = results[0].geometry.coordinates;
      return { lat, lng };
    }

    // 結果が見つからない場合、より短い住所で再試行
    const shorterAddress = shortenAddress(normalizedAddress);
    if (shorterAddress !== normalizedAddress) {
      const retryUrl = `${GSI_GEOCODE_API}?q=${encodeURIComponent(shorterAddress)}`;
      const retryResponse = await fetch(retryUrl);
      
      if (retryResponse.ok) {
        const retryResults: GsiGeocodeResult[] = await retryResponse.json();
        if (retryResults && retryResults.length > 0) {
          const [lng, lat] = retryResults[0].geometry.coordinates;
          return { lat, lng };
        }
      }
    }

    return null;
  } catch (error) {
    console.warn(`Geocode error for "${address}":`, error);
    return null;
  }
}

/**
 * 住所を正規化
 */
function normalizeAddress(address: string): string {
  return address
    // 全角数字を半角に
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    // 全角ハイフンを半角に
    .replace(/[ー−―]/g, '-')
    // 余分な空白を削除
    .replace(/\s+/g, '')
    // 「丁目」「番地」「号」を簡略化
    .replace(/丁目/g, '-')
    .replace(/番地?/g, '-')
    .replace(/号/g, '')
    // 連続するハイフンを1つに
    .replace(/-+/g, '-')
    // 末尾のハイフンを削除
    .replace(/-$/, '');
}

/**
 * 住所を短くする（市区町村レベルまで）
 */
function shortenAddress(address: string): string {
  // 市区町村までを抽出
  const match = address.match(/^(.+?[都道府県])(.+?[市区町村郡])/);
  if (match) {
    return match[1] + match[2];
  }
  return address;
}

/**
 * 複数の薬局の住所をジオコーディング
 * KVにキャッシュを保存して再利用
 */
export async function geocodeAddresses(
  pharmacies: Pharmacy[],
  env: Env
): Promise<Pharmacy[]> {
  const results: Pharmacy[] = [];
  const batchSize = 10; // 同時リクエスト数
  const delayMs = 100; // リクエスト間の遅延

  console.log(`Starting geocoding for ${pharmacies.length} pharmacies...`);

  for (let i = 0; i < pharmacies.length; i += batchSize) {
    const batch = pharmacies.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (pharmacy) => {
        // キャッシュをチェック
        const cacheKey = `${KV_KEYS.GEOCODE_PREFIX}${pharmacy.address}`;
        const cached = await env.PHARMACY_DATA.get(cacheKey);
        
        if (cached) {
          const { lat, lng } = JSON.parse(cached);
          return { ...pharmacy, lat, lng };
        }

        // ジオコーディング実行
        const coords = await geocodeAddress(pharmacy.address);
        
        if (coords) {
          // キャッシュに保存（30日間）
          await env.PHARMACY_DATA.put(
            cacheKey,
            JSON.stringify(coords),
            { expirationTtl: 30 * 24 * 60 * 60 }
          );
          return { ...pharmacy, lat: coords.lat, lng: coords.lng };
        }

        return pharmacy;
      })
    );

    results.push(...batchResults);

    // 進捗ログ
    if ((i + batchSize) % 100 === 0 || i + batchSize >= pharmacies.length) {
      console.log(`Geocoded ${Math.min(i + batchSize, pharmacies.length)}/${pharmacies.length} pharmacies`);
    }

    // レート制限対策
    if (i + batchSize < pharmacies.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const geocodedCount = results.filter(p => p.lat !== null).length;
  console.log(`Geocoding complete: ${geocodedCount}/${results.length} successfully geocoded`);

  return results;
}
