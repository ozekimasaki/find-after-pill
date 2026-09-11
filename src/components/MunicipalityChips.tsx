interface MunicipalityChipsProps {
  counts: Record<string, number>;
  selected?: string;
  onSelect: (municipality: string) => void;
}

export function MunicipalityChips({ counts, selected, onSelect }: MunicipalityChipsProps) {
  const cities = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .slice(0, 24);

  if (cities.length < 2) {
    return null;
  }

  return (
    <div className="mb-3">
      <p className="sr-only">市区町村で絞り込む</p>
      <div className="flex flex-wrap gap-1.5">
        {cities.map(([name, count]) => {
          const isActive = selected === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full border whitespace-nowrap ${
                isActive
                  ? 'bg-[#65BBE9] text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {name}
              <span className={isActive ? 'text-white/90' : 'text-gray-400'}>
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
