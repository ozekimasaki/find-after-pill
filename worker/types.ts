/**
 * Cloudflare Workers 環境変数の型定義
 */
export interface Env {
  /** 薬局データを保存するKV Namespace */
  PHARMACY_DATA: KVNamespace;
  /** 静的アセット */
  ASSETS: Fetcher;
}

/**
 * KVに保存するデータのキー
 */
export const KV_KEYS = {
  /** 薬局データ本体 */
  PHARMACIES: 'pharmacies',
  /** メタ情報 */
  META: 'meta',
  /** ジオコーディングキャッシュのプレフィックス */
  GEOCODE_PREFIX: 'geocode:',
} as const;
