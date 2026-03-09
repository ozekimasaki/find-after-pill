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

/**
 * 都道府県リスト
 */
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];

/**
 * HTML エスケープ
 */
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * ルートページのプリレンダリングHTML注入
 */
async function handleRootPage(request: Request, env: Env): Promise<Response> {
  // index.html を取得
  const assetResponse = await env.ASSETS.fetch(request);
  let html = await assetResponse.text();

  try {
    // KV からメタデータ取得
    const metaJson = await getLocalData(env, KV_KEYS.META);
    const meta: PharmacyMeta | null = metaJson ? JSON.parse(metaJson) : null;

    // KV から薬局データ取得して都道府県別カウント
    const pharmaciesJson = await getLocalData(env, KV_KEYS.PHARMACIES);
    let prefectureCounts: Record<string, number> = {};
    let totalCount = meta?.totalCount || 0;

    if (pharmaciesJson) {
      const pharmacies: Pharmacy[] = JSON.parse(pharmaciesJson);
      for (const p of pharmacies) {
        prefectureCounts[p.prefecture] = (prefectureCounts[p.prefecture] || 0) + 1;
      }
      if (!totalCount) totalCount = pharmacies.length;
    }

    // 最終更新日フォーマット
    const lastUpdated = meta?.lastUpdated
      ? new Date(meta.lastUpdated).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    // 都道府県リストHTML生成
    const prefectureListHtml = PREFECTURES
      .filter(pref => prefectureCounts[pref])
      .map(pref => `<li>${escapeHtml(pref)}（${prefectureCounts[pref]}件）</li>`)
      .join('');

    // プリレンダリングHTML
    const prerenderHtml = `
      <header>
        <h1>緊急避妊薬ナビ - ノルレボ・レソエル72・アフターピル販売薬局検索</h1>
        <p>全国${totalCount.toLocaleString()}件の薬局で緊急避妊薬（アフターピル）を購入できます</p>
        ${lastUpdated ? `<p>最終更新: ${escapeHtml(lastUpdated)}</p>` : ''}
      </header>
      <main>
        <section>
          <h2>都道府県から緊急避妊薬の販売薬局を探す</h2>
          <ul>${prefectureListHtml}</ul>
        </section>
        <section>
          <h2>緊急避妊薬（アフターピル）について</h2>
          <p>緊急避妊薬は、性交後72時間以内に服用することで妊娠を防ぐ薬です。有効成分はレボノルゲストレル1.5mgで、商品名はノルレボ（先発医薬品）およびレソエル72（後発医薬品）です。</p>
          <p>2024年11月28日から、処方箋なしで一部の薬局で購入できるようになりました。当サイトでは厚生労働省の公式データに基づき、販売可能な薬局を検索できます。</p>
        </section>
        <section>
          <h2>よくある質問</h2>
          <h3>緊急避妊薬（アフターピル）はどこで買えますか？</h3>
          <p>処方箋なしで一部の薬局で購入できます。厚生労働省が公開している販売可能な薬局一覧に掲載されている薬局が対象です。</p>
          <h3>ノルレボとレソエル72の違いは何ですか？</h3>
          <p>どちらもレボノルゲストレル1.5mgを有効成分とする緊急避妊薬です。ノルレボは先発医薬品、レソエル72は後発医薬品（ジェネリック）で、効果や用法は同じです。</p>
          <h3>緊急避妊薬の値段はいくらですか？</h3>
          <p>薬局での販売価格は7,000円〜9,000円程度が目安です（税込）。</p>
        </section>
      </main>`;

    // 動的JSON-LD
    const dynamicJsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': '緊急避妊薬ナビ',
      'url': 'https://find-after-pill.com/',
      'description': `全国${totalCount.toLocaleString()}件の薬局で緊急避妊薬（ノルレボ・レソエル72・アフターピル）を購入できます`,
      ...(lastUpdated ? { 'dateModified': meta!.lastUpdated } : {}),
    });

    // index.html に注入
    html = html.replace(
      '<div id="root">',
      `<div id="root">${prerenderHtml}`
    );

    // 動的JSON-LDを</head>の前に注入
    html = html.replace(
      '</head>',
      `<script type="application/ld+json">${dynamicJsonLd}</script>\n  </head>`
    );
  } catch (e) {
    console.error('Pre-render error:', e);
    // エラー時はオリジナルHTMLをそのまま返す
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      ...Object.fromEntries(
        [...assetResponse.headers.entries()].filter(([k]) => k.toLowerCase() !== 'content-type')
      ),
    },
  });
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

    // ルートページ: プリレンダリングHTML注入
    if (url.pathname === '/' || url.pathname === '') {
      return handleRootPage(request, env);
    }

    // 静的アセットは Cloudflare が自動的に処理
    return env.ASSETS.fetch(request);
  },
};
