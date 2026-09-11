import { useState } from 'react';
import { compareMunicipalityNames } from '../utils/municipalityRank';

interface MunicipalityChipsProps {
  counts: Record<string, number>;
  selected?: string;
  preferred?: string | null;
  onSelect: (municipality: string) => void;
}

const PREVIEW_COUNT = 4;

function pickPreview(
  cities: Array<[string, number]>,
  selected?: string,
  preferred?: string | null,
): Array<[string, number]> {
  const picked: Array<[string, number]> = [];
  const used = new Set<string>();

  const add = (entry: [string, number] | undefined) => {
    if (!entry || used.has(entry[0]) || picked.length >= PREVIEW_COUNT) {
      return;
    }
    used.add(entry[0]);
    picked.push(entry);
  };

  add(preferred ? cities.find(([name]) => name === preferred) : undefined);
  add(selected ? cities.find(([name]) => name === selected) : undefined);
  for (const entry of cities) {
    add(entry);
  }
  return picked;
}

export function MunicipalityChips({
  counts,
  selected,
  preferred,
  onSelect,
}: MunicipalityChipsProps) {
  const [expanded, setExpanded] = useState(false);
  const cities = Object.entries(counts)
    .sort((a, b) => compareMunicipalityNames(a[0], b[0], preferred, counts))
    .slice(0, 24);

  if (cities.length < 2) {
    return null;
  }

  const visible = expanded ? cities : pickPreview(cities, selected, preferred);
  const hiddenCount = Math.max(0, cities.length - visible.length);

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
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(name)}
              aria-pressed={isActive}
              aria-current={preferred === name ? 'true' : undefined}
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs sm:text-sm rounded-full border whitespace-nowrap ${
                isActive
                  ? 'bg-[#65BBE9] text-white border-transparent'
                  : preferred === name
                    ? 'bg-[#EBF6FC] text-gray-800 border-[#65BBE9]'
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
            className="inline-flex items-center px-2 py-0.5 text-xs sm:text-sm text-[#4AA8D9] rounded-full border border-transparent hover:bg-[#EBF6FC]"
          >
            {expanded ? 'とじる' : `ほか${hiddenCount}の市区`}
          </button>
        )}
      </div>
    </div>
  );
}
