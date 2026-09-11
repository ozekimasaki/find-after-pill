import { useState } from 'react';

interface MunicipalityChipsProps {
  counts: Record<string, number>;
  selected?: string;
  onSelect: (municipality: string) => void;
}

const PREVIEW_COUNT = 8;

export function MunicipalityChips({ counts, selected, onSelect }: MunicipalityChipsProps) {
  const [expanded, setExpanded] = useState(false);
  const cities = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .slice(0, 24);

  if (cities.length < 2) {
    return null;
  }

  const visible = expanded ? cities : cities.slice(0, PREVIEW_COUNT);

  return (
    <div className="mb-2">
      <p className="sr-only">市区町村で絞り込む</p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map(([name, count]) => {
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
        {cities.length > PREVIEW_COUNT && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex items-center px-2.5 py-1 text-sm text-[#4AA8D9] rounded-full border border-transparent hover:bg-[#EBF6FC]"
          >
            {expanded ? 'とじる' : `ほか${cities.length - PREVIEW_COUNT}の市区`}
          </button>
        )}
      </div>
    </div>
  );
}
