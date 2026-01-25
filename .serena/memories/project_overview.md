# プロジェクト概要

## プロジェクト名
Norlevo Portal - 緊急避妊薬 販売薬局検索

## 目的
厚生労働省が公開している「要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧」を検索しやすくしたポータルサイト

## 主な機能
- 現在地検索: GPSを使って近くの薬局を検索
- 都道府県フィルター: 都道府県ごとに絞り込み
- フリーワード検索: 薬局名・住所で検索
- 地図表示: Leaflet + OpenStreetMapで薬局の位置を表示
- 詳細表示: 薬局の詳細情報、Google Maps/Apple Mapsへのリンク

## 技術スタック
- フロントエンド: React + Vite + TypeScript
- バックエンド: Cloudflare Workers
- データストア: Cloudflare KV
- スタイリング: Tailwind CSS
- 地図: Leaflet + OpenStreetMap
- 自動更新: GitHub Actions

## プロジェクト構造
- src/: Reactコンポーネントとメインロジック
  - components/: UIコンポーネント
  - hooks/: カスタムフック
  - types/: TypeScript型定義
  - utils/: ユーティリティ関数
- worker/: Cloudflare Workersのコード
- scripts/: データ取得・変換スクリプト
- public/data/: 静的データファイル

## データソース
厚生労働省 - 要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧