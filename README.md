# 緊急避妊薬ナビ (find-after-pill.com)

厚生労働省が公開している「要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧」を、検索しやすくしたポータルサイトです。現在地・都道府県・フリーワードから最寄りの薬局を素早く見つけられることを目的としています。

- **本番URL**: https://find-after-pill.com/
- **データソース**: [厚生労働省 - 要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧](https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html)

## 主な機能

- **現在地検索**: GPS（HTML5 Geolocation API）を使って近くの薬局を検索し、距離順にソート
- **都道府県フィルター**: 都道府県ごとに件数付きで絞り込み
- **フリーワード検索**: 薬局名・住所で検索
- **絞り込みフィルター**: 夜間・休日対応 / 予約不要 / 女性薬剤師在籍 / 個室あり
- **地図表示**: Leaflet + OpenStreetMap でマーカークラスタリング表示、ユーザー位置も表示
- **詳細表示**: 薬局の詳細モーダル、Google Maps / Apple Maps へのリンク、電話発信、共有ボタン
- **サポート導線**: #8103（性犯罪・性暴力被害者のためのワンストップ支援センター）ホットラインバナー

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 19 + TypeScript 5.9 + Vite 7 |
| スタイリング | Tailwind CSS 4 |
| 地図 | Leaflet 1.9 + react-leaflet 5 + leaflet.markercluster + OpenStreetMap |
| バックエンド | Cloudflare Workers (`worker/index.ts`) |
| データストア | Cloudflare KV (`PHARMACY_DATA` namespace) |
| データ取得 | xlsx（Excel解析） + cheerio（HTMLスクレイピング） |
| ジオコーディング | 国土地理院API (`msearch.gsi.go.jp`) |
| 画像処理 | sharp（OGP画像生成） |
| ビルド統合 | `@cloudflare/vite-plugin`（フロント・Worker を一体管理） |
| 自動更新 | GitHub Actions（毎日 UTC 21:00 = JST 6:00） |

## 要件

- Node.js 20 以上（GitHub Actions では Node.js 20 を使用）
- npm
- デプロイ・KV操作を行う場合は Cloudflare アカウントと `wrangler` の認証

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. KV Namespace の作成

```bash
npx wrangler kv namespace create PHARMACY_DATA
npx wrangler kv namespace create PHARMACY_DATA --preview
```

作成された ID を `wrangler.jsonc` の `kv_namespaces` に設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

Vite と Cloudflare Workers のローカルランタイムが `@cloudflare/vite-plugin` により一体で起動します。ローカルでは `public/data/` のフォールバック JSON が使われます。

### 4. デプロイ

```bash
npm run deploy
```

`vite build` でフロント・Worker をビルドし、`wrangler deploy` で Cloudflare にデプロイします。

## 開発コマンド

```bash
npm run dev            # 開発サーバー起動（Vite + Workers ローカル）
npm run build          # プロダクションビルド（vite build）
npm run preview        # ビルド成果物のプレビュー
npm run deploy         # ビルド + Cloudflare へデプロイ（vite build && wrangler deploy）
npm run lint           # ESLint 実行（eslint .）
npm run fetch-data     # 厚労省からデータ取得・変換（先頭500件をジオコーディング）
npm run generate-ogp   # OGP画像を再生成（sharp）
npm run cf-typegen     # Cloudflare の型を生成（wrangler types）
```

型チェックは TypeScript の project references を使って `npx tsc -b` で実行できます（専用の npm スクリプトはありません）。

## プロジェクト構成

```
├── src/                    # フロントエンド (React)
│   ├── App.tsx             # メインアプリ
│   ├── main.tsx            # エントリポイント（StrictMode）
│   ├── index.css           # グローバルスタイル（Tailwind import + カスタムアニメーション）
│   ├── components/         # UI コンポーネント（Header/Map/PharmacyList/FAQ など）
│   ├── hooks/              # useGeolocation / usePharmacies / useDebounce
│   ├── types/pharmacy.ts   # 型定義（Pharmacy, PharmacyMeta ほか）
│   └── utils/              # distance.ts（Haversine距離）/ pharmacyAvailability.ts
├── worker/                 # バックエンド (Cloudflare Workers)
│   ├── index.ts            # API ルーティング + ルートページのプリレンダリング注入
│   ├── types.ts            # Env 型定義、KV キー定数
│   └── lib/                # excel-parser.ts / geocoder.ts
├── scripts/                # fetch-data.ts / generate-ogp.ts / check-headers.ts
├── public/                 # 静的アセット（data/ のフォールバックJSON、robots.txt、sitemap.xml、OGP画像 など）
├── .github/workflows/      # update-data.yml（データ自動更新）
├── index.html              # HTMLテンプレート（SEOメタ・JSON-LD・noscript）
├── wrangler.jsonc          # Cloudflare Workers 設定
├── vite.config.ts          # Vite 設定（React + Tailwind + Cloudflare）
├── tsconfig*.json          # TypeScript 設定（app / node / worker の project references）
└── eslint.config.js        # ESLint 設定
```

## API エンドポイント

全 API は CORS `Access-Control-Allow-Origin: *` で公開されています。

| メソッド | パス | 例 | 説明 |
|---------|------|-----|------|
| GET | `/api/pharmacies` | — | 全薬局データ取得 |
| GET | `/api/pharmacies` | `?prefecture=東京都` | 都道府県フィルター |
| GET | `/api/pharmacies` | `?lat=35.68&lng=139.76&radius=5` | 位置検索（半径km） |
| GET | `/api/pharmacies` | `?query=薬局名` | フリーワード検索（名前・住所） |
| GET | `/api/meta` | — | メタ情報（lastUpdated, totalCount, sourceUrl ほか） |
| GET | `/api/prefectures` | — | 都道府県ごとの薬局数 |

## データ更新

### 自動更新（GitHub Actions）

`.github/workflows/update-data.yml` が毎日 UTC 21:00（JST 6:00）に実行され（`workflow_dispatch` による手動実行も可能）、以下を行います。

1. `GEOCODE_ALL=true npm run fetch-data` で全薬局データを取得・ジオコーディング
2. データに変更があれば `wrangler kv key put` で `pharmacies` / `meta` を Cloudflare KV にアップロード
3. `public/data/meta.json` の更新をコミット
4. GitHub Actions のサマリーに件数・更新日を出力

必要な GitHub Secrets:

| Secret 名 | 用途 |
|-----------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 認証（Workers KV Storage: Edit / Workers Scripts: Edit） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |
| `KV_NAMESPACE_ID` | 本番 KV Namespace の ID |

### 手動更新

```bash
# データを取得・変換（ローカル、先頭500件のみジオコーディング）
npm run fetch-data

# 全件ジオコーディング（時間がかかります）
GEOCODE_ALL=true npm run fetch-data

# KV にアップロード
npx wrangler kv key put --namespace-id=<KV_NAMESPACE_ID> --remote pharmacies --path=public/data/pharmacies.json
npx wrangler kv key put --namespace-id=<KV_NAMESPACE_ID> --remote meta --path=public/data/meta.json
```

## ライセンス

MIT
