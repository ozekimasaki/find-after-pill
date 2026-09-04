import type { PharmacyMeta } from '../types/pharmacy';

interface HeaderProps {
  meta: PharmacyMeta | null;
}

export function Header({ meta }: HeaderProps) {
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
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">
              緊急避妊薬ナビ
            </h1>
            <p className="mt-1 text-white text-sm sm:text-base">
              あなたの近くの薬局をすぐに見つけられます
            </p>
            <span className="sr-only">ノルレボ・レソエル72等の緊急避妊薬（アフターピル）を販売している薬局を検索できます</span>
          </div>
          <nav aria-label="ページ内リンク" className="hidden sm:flex items-center gap-4 mt-1">
            <a href="/guide.html" className="inline-flex items-center gap-1 text-sm text-white bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-full transition-colors">
              はじめての方へ
            </a>
            <a href="#faq" className="inline-flex items-center gap-1 text-sm text-white bg-white/25 hover:bg-white/35 px-4 py-1.5 rounded-full transition-colors">
              <span>?</span>
              よくある質問
            </a>
          </nav>
        </div>
        <nav aria-label="ページ内リンク" className="sm:hidden mt-2 flex flex-wrap gap-2">
          <a href="/guide.html" className="inline-flex items-center gap-1 text-xs text-white bg-white/25 hover:bg-white/35 px-3 py-1.5 rounded-full transition-colors">
            はじめての方へ
          </a>
          <a href="#faq" className="inline-flex items-center gap-1 text-xs text-white bg-white/25 hover:bg-white/35 px-3 py-1.5 rounded-full transition-colors">
            <span>?</span>
            よくある質問
          </a>
        </nav>
        {meta && (
          <div className="mt-1 sm:mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-white/90">
            <span>登録薬局数: {meta.totalCount.toLocaleString()}件</span>
            <span>最終更新: {formatDate(meta.lastUpdated)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
