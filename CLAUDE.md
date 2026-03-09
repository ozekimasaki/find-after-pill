# CLAUDE.md - 緊急避妊薬ナビ (find-after-pill.com)

## プロジェクト概要

厚生労働省が公開する「緊急避妊薬の販売が可能な薬局一覧」を検索できるポータルサイト。
ユーザーが現在地・都道府県・フリーワードから最寄りの薬局を素早く見つけられることが目的。

- **本番URL**: https://find-after-pill.com/
- **Worker URL**: https://norlevo-portal.maigo999.workers.dev
- **リポジトリオーナー**: @mei_999_

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4 |
| バックエンド | Cloudflare Workers (`worker/index.ts`) |
| データストア | Cloudflare KV (`PHARMACY_DATA` namespace) |
| 地図 | Leaflet 1.9 + react-leaflet 5 + OpenStreetMap |
| データ取得 | xlsx (Excel解析) + cheerio (スクレイピング) |
| ジオコーディング | 国土地理院API (`msearch.gsi.go.jp`) |
| 画像処理 | sharp (OGP画像生成) |
| CI/CD | GitHub Actions（毎日 UTC 21:00 = JST 6:00 にデータ自動更新） |
| ビルド統合 | `@cloudflare/vite-plugin` でフロント・ワーカーを一体管理 |

## ディレクトリ構成

```
├── src/                        # フロントエンド (React)
│   ├── App.tsx                 # メインアプリ（位置検索優先レイアウト、モバイル折りたたみ、Back-to-top）
│   ├── main.tsx                # エントリポイント（StrictMode）
│   ├── index.css               # グローバルスタイル（Tailwind import + カスタムアニメーション定義）
│   ├── components/
│   │   ├── Header.tsx          # ヘッダー（モバイルコンパクト、共感コピー）
│   │   ├── Footer.tsx          # フッター（3カラム: サイト説明・薬情報・注意事項・相談窓口）
│   │   ├── SearchBar.tsx       # フリーワード検索入力
│   │   ├── PrefectureFilter.tsx # 都道府県ドロップダウン（件数付き、ブルーフォーカスリング）
│   │   ├── LocationButton.tsx  # 現在地取得ボタン（塗りつぶしスタイル、GPS補助テキスト付き）
│   │   ├── FilterPanel.tsx     # 絞り込みフィルター（夜間休日/予約不要/女性薬剤師/個室あり）
│   │   ├── SupportBanner.tsx   # #8103ホットラインバナー（dismissible、sessionStorage）
│   │   ├── PharmacyList.tsx    # 薬局一覧（20件/ページ、もっと見る、スタガーフェードイン）
│   │   ├── PharmacyCard.tsx    # 薬局カード（全幅電話ボタン、要事前連絡バッジ、営業時間短縮表示）
│   │   ├── PharmacyDetail.tsx  # 薬局詳細モーダル（scroll lock、Escape/swipe閉じ、共有ボタン、行動ガイド）
│   │   ├── Map.tsx             # 地図表示（Leafletマーカークラスタリング、ユーザー位置）
│   │   └── FAQ.tsx             # よくある質問（アコーディオン形式、7問、高さトランジション）
│   ├── hooks/
│   │   ├── useGeolocation.ts   # HTML5 Geolocation API（高精度、10秒タイムアウト）
│   │   └── usePharmacies.ts    # /api/pharmacies データ取得・距離計算・ソート
│   ├── types/
│   │   └── pharmacy.ts         # 型定義（Pharmacy, PharmacyMeta, SearchParams等）
│   └── utils/
│       └── distance.ts         # Haversine距離計算 + formatDistance
├── worker/                     # バックエンド (Cloudflare Workers)
│   ├── index.ts                # APIルーティング + ルートページSSR（プリレンダリング注入）
│   ├── types.ts                # Env型定義、KVキー定数
│   └── lib/
│       ├── excel-parser.ts     # 厚労省ページスクレイピング → Excelダウンロード → パース
│       └── geocoder.ts         # 国土地理院APIジオコーディング（住所正規化、リトライ付き）
├── scripts/
│   ├── fetch-data.ts           # データ取得パイプライン（Excel → JSON → ジオコーディング → KVアップロード）
│   ├── generate-ogp.ts         # OGP画像生成（sharp）
│   └── check-headers.ts        # レスポンスヘッダー確認ユーティリティ
├── public/
│   ├── data/                   # ローカル開発用フォールバックJSON
│   │   ├── pharmacies.json
│   │   └── meta.json
│   ├── robots.txt              # クローラー制御
│   ├── sitemap.xml             # サイトマップ
│   ├── favicon.svg
│   └── og-image.png / .svg     # OGP画像
├── .github/workflows/
│   └── update-data.yml         # 毎日データ自動更新ワークフロー
├── index.html                  # HTMLテンプレート（SEOメタ・JSON-LD・noscript付き）
├── wrangler.jsonc              # Cloudflare Workers設定
├── vite.config.ts              # Vite設定（React + Tailwind + Cloudflare統合）
├── tsconfig.json               # TypeScript設定（project references）
├── tsconfig.app.json           # フロント用 (ES2022, react-jsx)
├── tsconfig.node.json          # スクリプト用 (ES2023)
├── tsconfig.worker.json        # Worker用 (ES2022, @cloudflare/workers-types)
└── eslint.config.js            # ESLint設定
```

## よく使うコマンド

```bash
npm run dev                      # 開発サーバー起動（Vite + Workers ローカル）
npm run build                    # プロダクションビルド
npm run deploy                   # ビルド + Cloudflareデプロイ（wrangler deploy）
npm run lint                     # ESLint実行
npm run fetch-data               # 厚労省からデータ取得（最初の500件ジオコーディング）
GEOCODE_ALL=true npm run fetch-data  # 全件ジオコーディング
npm run generate-ogp             # OGP画像再生成
npm run cf-typegen               # Cloudflare型生成
```

## API エンドポイント

| メソッド | パス | パラメータ | 説明 |
|---------|------|----------|------|
| GET | `/api/pharmacies` | — | 全薬局データ取得 |
| GET | `/api/pharmacies` | `prefecture=東京都` | 都道府県フィルター |
| GET | `/api/pharmacies` | `lat=35.68&lng=139.76&radius=5` | 位置検索（半径km、デフォルト10km） |
| GET | `/api/pharmacies` | `query=薬局名` | フリーワード検索（名前・住所） |
| GET | `/api/meta` | — | メタ情報（lastUpdated, totalCount, sourceUrl） |
| GET | `/api/prefectures` | — | 都道府県ごとの薬局数 |

全APIは CORS `Access-Control-Allow-Origin: *` で公開。

## データフロー

```
厚労省ページ → Excel → パース → Pharmacy[] → ジオコーディング → JSON
                                                                    ↓
GitHub Actions (毎日UTC 21:00) → wrangler kv put → Cloudflare KV
                                                                    ↓
Worker (KV読取) → API配信 + ルートページHTML注入（SSR的プリレンダリング）
                                                                    ↓
React SPA (クライアント) → マウント時にプリレンダリングHTMLを上書き
```

## Worker のルーティング

```
リクエスト
  ├── /api/*        → handleApiRequest()  # JSON API
  ├── /             → handleRootPage()    # index.html + プリレンダリングHTML注入
  └── その他        → env.ASSETS.fetch()  # 静的アセット配信
```

**プリレンダリング (`handleRootPage`)**: ルートアクセス時に KV からデータを読み、`<div id="root">` 内に都道府県リスト・FAQ・薬の説明を注入。動的JSON-LDも `</head>` 前に挿入。Reactマウント後は上書きされるためUXに影響なし。

## SEO 構成

- **メタタグ**: title/description/keywords にノルレボ・レソエル72・アフターピルを含む
- **OGP/Twitter Card**: 画像・タイトル・説明を設定済み
- **JSON-LD**: WebSite + SearchAction, FAQPage（5問）を `index.html` に静的記述
- **動的JSON-LD**: Worker がリクエスト時に薬局数・更新日を含むスキーマを注入
- **noscript**: JS無効環境向けにキーワードリッチなHTMLフォールバック
- **robots.txt / sitemap.xml**: `public/` に配置
- **見出し階層**: H1(Header) → H2(検索/結果/FAQ/Footer各セクション) を適切に配置
- **セマンティックHTML**: `role="search"`, `role="dialog"`, `aria-modal`, `aria-live="polite"`, `<nav aria-label>`, `sr-only` 見出し
- **ヘッダーコピー**: ユーザー向けは共感メッセージ、SEOキーワードは `sr-only` で保持

## コーディング規約

- TypeScript strict モード（全 tsconfig で `strict: true`）
- コンポーネントは `export function` 形式の関数コンポーネント + hooks
- スタイリングは Tailwind CSS ユーティリティクラス（CSS-in-JS 不使用）
- テーマカラー: `#65BBE9`（ブランドブルー）、ホバー: `#4AA8D9`、ライト: `#EBF6FC`
- カラー統一: ピンク系不使用 → 全てブランドブルーに統一（マップマーカー、リンク、フォーカスリング含む）
- アニメーション: `animate-fadeIn` / `animate-slideUp` / `animate-fadeInScale`（`@utility` で定義、`prefers-reduced-motion` 対応済み）
- 日本語ロケール対象（`lang="ja"`）
- `PREFECTURES` 定数配列は `src/types/pharmacy.ts` と `worker/index.ts` の両方に定義あり
- Google Analytics: `G-D52XFQ57RS`

## UI/UX 設計方針

- **ターゲットユーザー**: 不安な状態でスマホから初めて訪れる若い女性（16-30歳）
- **モバイルファースト**: 位置検索ボタンを最上位に配置、テキスト検索はモバイルで折りたたみ
- **共感トーン**: 警告色（黄/赤）よりも案内色（青）、フィルターラベルは日常語（「予約なしで行ける」等）
- **モーダル**: body scroll lock、Escape閉じ、スワイプ閉じ、ドラッグハンドル対応
- **フィルター**: 「夜間・休日も対応」「予約なしで行ける」「女性の薬剤師がいる」「個室あり」（`privacyMeasures` に「個室」を含むかで判定）
- **サポート導線**: #8103ホットラインバナーを `SupportBanner` で上部に表示（sessionStorage で dismiss 管理）

## 主要な型定義 (`src/types/pharmacy.ts`)

```typescript
interface Pharmacy {
  id: string;
  pharmacyNumber: string;
  prefecture: string;
  name: string;
  address: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  pharmacistFemale: number;
  pharmacistMale: number;
  pharmacistOther: number;
  website: string;
  businessHours: string;
  afterHoursService: boolean;
  afterHoursPhone: string;
  privacyMeasures: string;
  advanceCallRequired: boolean;
  notes: string;
}

interface PharmacyMeta {
  lastUpdated: string;   // ISO 8601
  totalCount: number;
  sourceUrl: string;
  fileName: string;
}
```

## 環境変数・シークレット

| 変数名 | 用途 | 設定場所 |
|--------|------|---------|
| `PHARMACY_DATA` | KV Namespace バインディング | wrangler.jsonc |
| `ASSETS` | 静的アセット Fetcher | wrangler.jsonc (自動) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API認証 | GitHub Secrets |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflareアカウント | GitHub Secrets |
| `KV_NAMESPACE_ID` | KV Namespace ID | GitHub Secrets |
| `GEOCODE_ALL` | 全件ジオコーディング有効化 | 環境変数 (true/false) |

## 注意事項

- `public/data/` の JSON はローカル開発用フォールバック。本番は KV から配信
- ジオコーディングは国土地理院APIを使用（レート制限: 並列10件、100ms間隔）
- KV Namespace ID: `fc31f846ec04459795c527ed04d9fd8f`（本番）、`e47e316a4bc142c2b1a0ac8995811781`（プレビュー）
- Wrangler のワーカー名: `norlevo-portal`
- `dist/` は `.gitignore` に含まれているがリポジトリに残っている場合がある
- `compatibility_date`: 2025-01-01
- Leaflet のデフォルト表示中心: 東京 (35.6812, 139.7671)
- Worker の `handleRootPage` で HTML を文字列操作しているため、`<div id="root">` の形式変更時は要注意

## CI/CD ワークフロー (`update-data.yml`)

1. 毎日 UTC 21:00（JST 6:00）に自動実行（手動トリガーも可能）
2. `npm run fetch-data`（`GEOCODE_ALL=true`）で全薬局データ取得・ジオコーディング
3. `wrangler kv key put` で pharmacies.json / meta.json を KV にアップロード
4. GitHub Actions サマリーに件数・更新日を出力
5. 必要シークレット: `KV_NAMESPACE_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
