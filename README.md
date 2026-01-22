# Norlevo Portal - 緊急避妊薬 販売薬局検索

厚生労働省が公開している「要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧」を検索しやすくしたポータルサイトです。

## 機能

- **現在地検索**: GPSを使って近くの薬局を検索
- **都道府県フィルター**: 都道府県ごとに絞り込み
- **フリーワード検索**: 薬局名・住所で検索
- **地図表示**: Leaflet + OpenStreetMapで薬局の位置を表示
- **詳細表示**: 薬局の詳細情報、Google Maps/Apple Mapsへのリンク

## 技術スタック

- **フロントエンド**: React + Vite + TypeScript
- **バックエンド**: Cloudflare Workers
- **データストア**: Cloudflare KV
- **スタイリング**: Tailwind CSS
- **地図**: Leaflet + OpenStreetMap
- **自動更新**: GitHub Actions

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. KV Namespaceの作成

```bash
npx wrangler kv namespace create PHARMACY_DATA
npx wrangler kv namespace create PHARMACY_DATA --preview
```

作成されたIDを `wrangler.jsonc` に設定してください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

### 4. デプロイ

```bash
npm run deploy
```

## 自動データ更新（GitHub Actions）

GitHub Actionsで毎日自動的にデータを更新します。

### セットアップ手順

1. **Cloudflare API Tokenを作成**
   - [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) にアクセス
   - 「Create Token」→「Edit Cloudflare Workers」テンプレートを使用
   - または以下の権限でカスタムトークンを作成:
     - Account > Workers KV Storage > Edit
     - Account > Workers Scripts > Edit

2. **GitHubリポジトリのSecretsを設定**
   - リポジトリの Settings > Secrets and variables > Actions
   - 以下のSecretsを追加:

   | Secret名 | 値 |
   |----------|-----|
   | `CLOUDFLARE_API_TOKEN` | 作成したAPIトークン |
   | `CLOUDFLARE_ACCOUNT_ID` | `6f2f1ee8a618e7fcb9f6737c3a84c526` |
   | `KV_NAMESPACE_ID` | `fc31f846ec04459795c527ed04d9fd8f` |

3. **手動実行でテスト**
   - Actions タブ > 「Update Pharmacy Data」 > 「Run workflow」

### スケジュール

- 毎日 UTC 21:00（日本時間 6:00）に自動実行
- 手動実行も可能（workflow_dispatch）

## 手動データ更新

```bash
# データを取得・変換（ローカル、最初の500件のみジオコーディング）
npm run fetch-data

# 全件ジオコーディング（時間がかかります）
GEOCODE_ALL=true npm run fetch-data

# KVにアップロード
npx wrangler kv key put --namespace-id=fc31f846ec04459795c527ed04d9fd8f --remote pharmacies --path=public/data/pharmacies.json
npx wrangler kv key put --namespace-id=fc31f846ec04459795c527ed04d9fd8f --remote meta --path=public/data/meta.json
```

## API エンドポイント

- `GET /api/pharmacies` - 全薬局データ取得
- `GET /api/pharmacies?prefecture=東京都` - 都道府県フィルター
- `GET /api/pharmacies?lat=35.68&lng=139.76&radius=5` - 位置検索（半径5km）
- `GET /api/pharmacies?query=薬局名` - フリーワード検索
- `GET /api/meta` - メタ情報（最終更新日時等）
- `GET /api/prefectures` - 都道府県ごとの薬局数

## データソース

- [厚生労働省 - 要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧](https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html)

## ライセンス

MIT
