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
    <header className="bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          緊急避妊薬 販売薬局検索
        </h1>
        <p className="mt-2 text-pink-100 text-sm sm:text-base">
          要指導医薬品として緊急避妊薬（Norlevo等）を販売可能な薬局を検索できます
        </p>
        {meta && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-pink-100">
            <span>登録薬局数: {meta.totalCount.toLocaleString()}件</span>
            <span>最終更新: {formatDate(meta.lastUpdated)}</span>
          </div>
        )}
      </div>
    </header>
  );
}
