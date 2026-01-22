import { Env, KV_KEYS } from './types';
import type { Pharmacy, PharmacyMeta } from '../src/types/pharmacy';

/**
 * 距離計算（Haversine formula）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球の半径（km）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * CORS ヘッダーを追加
 */
function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

/**
 * JSON レスポンスを返す
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(),
    },
  });
}

/**
 * エラーレスポンスを返す
 */
function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * ローカル開発用: 静的JSONファイルからデータを取得
 */
async function getLocalData(env: Env, key: string): Promise<string | null> {
  try {
    // KVが利用可能な場合はKVから取得
    const kvData = await env.PHARMACY_DATA?.get(key);
    if (kvData) return kvData;
  } catch {
    // KVが利用できない場合は静的ファイルから取得
  }

  // 静的ファイルから取得（ローカル開発用）
  try {
    const fileName = key === KV_KEYS.PHARMACIES ? 'pharmacies.json' : 'meta.json';
    const response = await env.ASSETS.fetch(new Request(`http://localhost/data/${fileName}`));
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // 静的ファイルも取得できない場合
  }

  return null;
}

/**
 * API リクエストを処理
 */
async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // GET /api/pharmacies
  if (path === '/api/pharmacies' && request.method === 'GET') {
    try {
      const pharmaciesJson = await getLocalData(env, KV_KEYS.PHARMACIES);
      const metaJson = await getLocalData(env, KV_KEYS.META);

      if (!pharmaciesJson) {
        return jsonResponse({ pharmacies: [], meta: null });
      }

      let pharmacies: Pharmacy[] = JSON.parse(pharmaciesJson);
      const meta: PharmacyMeta | null = metaJson ? JSON.parse(metaJson) : null;

      // フィルタリング
      const prefecture = url.searchParams.get('prefecture');
      const query = url.searchParams.get('query');
      const lat = url.searchParams.get('lat');
      const lng = url.searchParams.get('lng');
      const radius = url.searchParams.get('radius');

      // 都道府県フィルター
      if (prefecture) {
        pharmacies = pharmacies.filter(p => p.prefecture === prefecture);
      }

      // フリーワード検索
      if (query) {
        const lowerQuery = query.toLowerCase();
        pharmacies = pharmacies.filter(p => 
          p.name.toLowerCase().includes(lowerQuery) ||
          p.address.toLowerCase().includes(lowerQuery)
        );
      }

      // 位置検索
      if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const searchRadius = radius ? parseFloat(radius) : 10; // デフォルト10km

        pharmacies = pharmacies
          .filter(p => p.lat !== null && p.lng !== null)
          .map(p => ({
            ...p,
            distance: calculateDistance(userLat, userLng, p.lat!, p.lng!),
          }))
          .filter(p => (p as any).distance <= searchRadius)
          .sort((a, b) => (a as any).distance - (b as any).distance);
      }

      return jsonResponse({ pharmacies, meta });
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      return errorResponse('Failed to fetch pharmacies');
    }
  }

  // GET /api/meta
  if (path === '/api/meta' && request.method === 'GET') {
    try {
      const metaJson = await getLocalData(env, KV_KEYS.META);
      const meta: PharmacyMeta | null = metaJson ? JSON.parse(metaJson) : null;
      return jsonResponse({ meta });
    } catch (error) {
      console.error('Error fetching meta:', error);
      return errorResponse('Failed to fetch meta');
    }
  }

  // GET /api/prefectures - 都道府県ごとの薬局数を取得
  if (path === '/api/prefectures' && request.method === 'GET') {
    try {
      const pharmaciesJson = await getLocalData(env, KV_KEYS.PHARMACIES);
      if (!pharmaciesJson) {
        return jsonResponse({ prefectures: {} });
      }

      const pharmacies: Pharmacy[] = JSON.parse(pharmaciesJson);
      const prefectureCounts: Record<string, number> = {};

      for (const p of pharmacies) {
        prefectureCounts[p.prefecture] = (prefectureCounts[p.prefecture] || 0) + 1;
      }

      return jsonResponse({ prefectures: prefectureCounts });
    } catch (error) {
      console.error('Error fetching prefectures:', error);
      return errorResponse('Failed to fetch prefectures');
    }
  }

  return errorResponse('Not found', 404);
}

export default {
  /**
   * HTTP リクエストハンドラ
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API リクエスト
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    // 静的アセットは Cloudflare が自動的に処理
    return env.ASSETS.fetch(request);
  },
};
