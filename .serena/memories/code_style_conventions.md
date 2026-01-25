# コードスタイルと規約

## 設定ファイル
- ESLint: TypeScript + React Hooks + React Refresh
- TypeScript: 厳格な型付け
- Prettier: 未使用（手動整形）

## 命名規約
- コンポーネント: PascalCase (例: PharmacyCard)
- 関数/変数: camelCase (例: getUserLocation)
- 定数: UPPER_SNAKE_CASE (例: API_BASE_URL)
- ファイル名: 
  - コンポーネント: PascalCase.tsx
  - その他: camelCase.ts/.tsx

## コーディング規約
- TypeScriptの厳格な型付けを使用
- React Hooksのルールを厳守
- 関数コンポーネントを優先
- Propsはinterfaceで定義
- 非同期処理はasync/awaitを使用

## インポート順序
1. React関連
2. 外部ライブラリ
3. 内部コンポーネント
4. ユーティリティ関数
5. 型定義

## ディレクトリ構成
- src/components/: 再利用可能なUIコンポーネント
- src/hooks/: カスタムフック
- src/types/: 共通の型定義
- src/utils/: ユーティリティ関数
- src/assets/: 静的リソース