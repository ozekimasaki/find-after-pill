/**
 * 薬局データの型定義
 */
export interface Pharmacy {
  /** 一意のID（インデックスまたはハッシュ） */
  id: string;
  /** 薬局等番号 */
  pharmacyNumber?: string;
  /** 都道府県 */
  prefecture: string;
  /** 薬局名 */
  name: string;
  /** 住所 */
  address: string;
  /** 電話番号 */
  phone: string;
  /** 緯度 */
  lat: number | null;
  /** 経度 */
  lng: number | null;
  /** 女性薬剤師数 */
  pharmacistFemale?: number;
  /** 男性薬剤師数 */
  pharmacistMale?: number;
  /** 答えたくない薬剤師数 */
  pharmacistOther?: number;
  /** ホームページURL */
  website?: string;
  /** 開局時間 */
  businessHours?: string;
  /** 時間外対応 */
  afterHoursService?: string;
  /** 時間外の電話番号 */
  afterHoursPhone?: string;
  /** プライバシー確保策 */
  privacyMeasures?: string;
  /** 事前電話連絡 */
  advanceCallRequired?: string;
  /** 備考 */
  notes?: string;
}

/**
 * 薬局データのメタ情報
 */
export interface PharmacyMeta {
  /** 最終更新日時（ISO 8601形式） */
  lastUpdated: string;
  /** 薬局総数 */
  totalCount: number;
  /** データソースURL */
  sourceUrl: string;
  /** Excelファイル名 */
  fileName?: string;
}

/**
 * API レスポンス型
 */
export interface PharmacyApiResponse {
  pharmacies: Pharmacy[];
  meta: PharmacyMeta;
}

/**
 * 検索パラメータ
 */
export interface SearchParams {
  /** 都道府県フィルター */
  prefecture?: string;
  /** フリーワード検索 */
  query?: string;
  /** 現在地の緯度 */
  lat?: number;
  /** 現在地の経度 */
  lng?: number;
  /** 検索半径（km） */
  radius?: number;
}

/**
 * 都道府県リスト
 */
export const PREFECTURES = [
  '北海道',
  '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const;

export type Prefecture = typeof PREFECTURES[number];

/**
 * 位置情報の型
 */
export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

/**
 * 距離付き薬局データ
 */
export interface PharmacyWithDistance extends Pharmacy {
  /** 現在地からの距離（km） */
  distance?: number;
}
