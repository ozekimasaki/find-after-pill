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
    <header className="bg-gradient-to-r from-[#65BBE9] to-[#4AA8D9] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          緊急避妊薬ナビ
        </h1>
        <p className="mt-2 text-white/80 text-sm sm:text-base">
          緊急避妊薬（アフターピル）を販売している薬局を検索できます
        </p>
        {meta && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
            <span>登録薬局数: {meta.totalCount.toLocaleString()}件</span>
            <span>最終更新: {formatDate(meta.lastUpdated)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
