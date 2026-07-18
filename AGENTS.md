# AGENTS.md - 緊急避妊薬ナビ (find-after-pill.com)

このリポジトリで作業するコーディングエージェント向けのガイドです。厚生労働省が公開する「緊急避妊薬の販売が可能な薬局一覧」を検索できるポータルサイトで、React SPA（フロント）と Cloudflare Workers（API + プリレンダリング）を `@cloudflare/vite-plugin` で一体管理しています。

## プロジェクト構成とエントリポイント

```
├── src/                    # フロントエンド (React SPA)
│   ├── main.tsx            # フロントのエントリポイント（StrictMode で <App /> をマウント）
│   ├── App.tsx             # メインアプリ（検索・フィルター・地図・一覧の統合）
│   ├── index.css           # Tailwind import + カスタムアニメーション（@utility）
│   ├── components/         # UI コンポーネント（Header, Map, PharmacyList, PharmacyDetail, FAQ 等）
│   ├── hooks/              # useGeolocation, usePharmacies, useDebounce
│   ├── types/pharmacy.ts   # 型定義（Pharmacy, PharmacyMeta, SearchParams 等）と PREFECTURES 定数
│   └── utils/              # distance.ts（Haversine）, pharmacyAvailability.ts
├── worker/                 # バックエンド (Cloudflare Workers)
│   ├── index.ts            # Worker のエントリポイント（default export の fetch ハンドラ）
│   ├── types.ts            # Env 型、KV キー定数
│   └── lib/                # excel-parser.ts（スクレイピング/Excel解析）, geocoder.ts（国土地理院API）
├── scripts/                # tsx で実行する Node スクリプト
│   ├── fetch-data.ts       # データ取得パイプライン（Excel → JSON → ジオコーディング）
│   ├── generate-ogp.ts     # OGP画像生成（sharp）
│   └── check-headers.ts    # レスポンスヘッダー確認ユーティリティ
├── public/                 # 静的アセット。data/ にローカル開発用フォールバックJSON
├── .github/workflows/update-data.yml  # データ自動更新ワークフロー
├── index.html              # HTMLテンプレート（SEOメタ・JSON-LD・noscript）
├── wrangler.jsonc          # Cloudflare Workers 設定（name: norlevo-portal）
├── vite.config.ts          # Vite 設定（react + tailwindcss + cloudflare プラグイン）
└── tsconfig{.app,.node,.worker}.json  # project references（app / node / worker）
```

Worker のルーティング（`worker/index.ts` の `fetch`）:

- `/api/*` → JSON API（`/api/pharmacies`, `/api/meta`, `/api/prefectures`）
- `/` → `index.html` を返しつつ `<div id="root">` にプリレンダリングHTMLと動的 JSON-LD を注入
- その他 → `env.ASSETS.fetch()` で静的アセット配信

## セットアップ

- Node.js 20 以上 + npm。
- 依存インストールは `npm ci`（CI と同じ）または `npm install`。
- デプロイ・KV操作には Cloudflare 認証（`wrangler login` もしくは `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`）が必要。ドキュメント編集やローカル開発には不要。
- ローカル開発では KV の代わりに `public/data/` の JSON がフォールバックとして使われる。

## ビルド / テスト / Lint / 型チェック

package.json に定義されている実在のスクリプトのみを使うこと。

```bash
npm run dev          # 開発サーバー（Vite + Workers ローカル）
npm run build        # プロダクションビルド（vite build）
npm run preview      # ビルド成果物のプレビュー
npm run deploy       # vite build && wrangler deploy（Cloudflare へデプロイ）
npm run lint         # ESLint（eslint .）
npm run fetch-data   # scripts/fetch-data.ts を tsx で実行
npm run generate-ogp # scripts/generate-ogp.ts を tsx で実行
npm run cf-typegen   # wrangler types（Cloudflare 型生成）
```

- **型チェック**: 専用スクリプトはない。project references を使って `npx tsc -b` で実行する。
- **テスト**: このリポジトリにはテストフレームワーク・テストスクリプトは存在しない。テスト実行を求められた場合は、まずテスト基盤の追加要否を確認すること（勝手にテストを追加しない）。
- **注意（現状の既知の問題）**: `main` 時点で `npm run lint` と `npx tsc -b` はいずれも既存のエラーを報告する（`worker/lib/excel-parser.ts`, `worker/index.ts`, `src/utils/pharmacyAvailability.ts` 等）。これらは自分の変更で新たに増やさないこと。関係のない既存エラーの修正は、依頼された作業の範囲外なら行わない。

## コーディング規約

- TypeScript strict モード（全 tsconfig で `strict: true`）。`any` は極力避ける（ESLint `@typescript-eslint/no-explicit-any` 有効）。
- React コンポーネントは `export function` 形式の関数コンポーネント + hooks。
- スタイリングは Tailwind CSS 4 のユーティリティクラス。CSS-in-JS は使わない。カスタムアニメーションは `src/index.css` の `@utility` で定義。
- テーマカラー: ブランドブルー `#65BBE9`（ホバー `#4AA8D9`、ライト `#EBF6FC`）。ピンク系は使わずブルーに統一。
- 日本語ロケール対象（`lang="ja"`）。ユーザー向け文言は不安な利用者に配慮した共感トーン、警告色より案内色（青）を優先。
- ESLint は `eslint.config.js`（flat config: js recommended + typescript-eslint + react-hooks + react-refresh）。`dist` は無視対象。インデント等は既存コードに合わせる（セミコロンなし、シングルクォート基調）。
- import は各ファイル先頭にまとめる。

## 注意点

- `PREFECTURES` 定数は `src/types/pharmacy.ts` と `worker/index.ts` の両方に定義がある。片方だけ変更しないよう整合性に注意。
- `worker/index.ts` の `handleRootPage` は `index.html` を文字列操作してプリレンダリングHTMLを注入する。`<div id="root">` の形式や `index.html` の構造を変更する際は Worker 側の注入ロジックも合わせて確認する。
- `public/data/` の JSON はローカル開発用フォールバック。本番データは Cloudflare KV から配信される。
- ジオコーディングは国土地理院API を使用し、レート制限に配慮した並列制御がある（大量実行時は注意）。
- KV / Cloudflare の識別子は `wrangler.jsonc` を参照（Worker 名 `norlevo-portal`、`compatibility_date: 2025-01-01`）。
- データ自動更新は `.github/workflows/update-data.yml`（毎日 UTC 21:00 / JST 6:00、`workflow_dispatch` で手動実行可）。`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `KV_NAMESPACE_ID` の GitHub Secrets を使用。
- 秘密情報（API トークン等）をコード・コミットに含めない。
- 変更後は最低限 `npm run lint` と `npx tsc -b` を実行し、自分の変更が新たなエラーを増やしていないことを確認する。
