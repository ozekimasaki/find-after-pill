interface PrefectureChipsProps {
  counts: Record<string, number>;
  onSelect: (prefecture: string) => void;
  limit?: number;
}

function shortPrefectureName(name: string): string {
  return name.replace(/[都道府県]$/, '');
}

export function PrefectureChips({
  counts,
  onSelect,
  limit = 4,
}: PrefectureChipsProps) {
  const top = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (top.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <p className="sr-only">件数の多い都道府県</p>
      <div className="flex flex-wrap gap-1.5">
        {top.map(([name, count]) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            aria-label={`${name} ${count.toLocaleString()}件`}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            {shortPrefectureName(name)}
            <span className="text-gray-400">{count.toLocaleString()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
