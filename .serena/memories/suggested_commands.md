# 推奨コマンド

## 開発コマンド
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント
npm run lint

# プレビュー
npm run preview

# デプロイ
npm run deploy
```

## データ管理コマンド
```bash
# データ取得・変換（ローカル、最初の500件のみジオコーディング）
npm run fetch-data

# 全件ジオコーディング（時間がかかります）
GEOCODE_ALL=true npm run fetch-data

# OGP画像生成
npm run generate-ogp

# Cloudflare Types生成
npm run cf-typegen
```

## KV操作コマンド
```bash
# KV Namespace作成
npx wrangler kv namespace create PHARMACY_DATA
npx wrangler kv namespace create PHARMACY_DATA --preview

# KVにデータアップロード
npx wrangler kv key put --namespace-id=fc31f846ec04459795c527ed04d9fd8f --remote pharmacies --path=public/data/pharmacies.json
npx wrangler kv key put --namespace-id=fc31f846ec04459795c527ed04d9fd8f --remote meta --path=public/data/meta.json
```

## テスト・品質チェック
```bash
# ESLintチェック
npm run lint

# TypeScript型チェック
npx tsc --noEmit

# ビルドテスト
npm run build
```

## ユーティリティコマンド（Windows）
```powershell
# ファイル検索
Get-ChildItem -Recurse -Name "*.ts*"

# Git操作
git status
git add .
git commit -m "message"
git push

# ディレクトリ移動
cd src\components
```