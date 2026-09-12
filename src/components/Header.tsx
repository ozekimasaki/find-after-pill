import type { PharmacyMeta } from '../types/pharmacy';

interface HeaderProps {
  meta: PharmacyMeta | null;
  loadedCount?: number;
  compact?: boolean;
  hideFaq?: boolean;
}

export function Header({ meta, loadedCount, compact = false, hideFaq = false }: HeaderProps) {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <header className="bg-gradient-to-r from-[#65BBE9] to-[#4AA8D9] text-white shadow-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}>
      <div className={`max-w-7xl mx-auto px-4 ${compact ? 'py-1' : 'py-2.5'} sm:py-6`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-3xl font-bold">
              緊急避妊薬ナビ
            </h1>
            <p className="hidden sm:block mt-1 text-white text-base">
              あなたの近くの薬局をすぐに見つけられます
            </p>
            <span className="sr-only">ノルレボ・レソエル72等の緊急避妊薬（アフターピル）を販売している薬局を検索できます</span>
          </div>
          <nav aria-label="ページ内リンク" className={`shrink-0 ${compact || hideFaq ? 'hidden sm:block' : ''}`}>
            <a href="#faq" className="inline-flex items-center gap-1 text-xs sm:text-sm text-white bg-white/25 hover:bg-white/35 px-3 py-1.5 rounded-full transition-colors">
              <span>?</span>
              よくある質問
            </a>
          </nav>
        </div>
        {(meta || (loadedCount !== undefined && loadedCount > 0)) && (
          <div className={`mt-1 sm:mt-3 flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-white/90 ${
            compact ? 'hidden sm:flex' : 'flex'
          }`}>
            <span>
              検索できる薬局: {(loadedCount ?? meta?.totalCount ?? 0).toLocaleString()}件
            </span>
            {meta && <span className="hidden sm:inline">最終更新: {formatDate(meta.lastUpdated)}</span>}
          </div>
        )}
      </div>
    </header>
  );
}
