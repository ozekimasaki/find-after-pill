import { useState, type ReactNode } from 'react';
import { compareMunicipalityNames, shortMunicipalityLabel } from '../utils/municipalityRank';

interface MunicipalityChipsProps {
  counts: Record<string, number>;
  selected?: string;
  preferred?: string | null;
  onSelect: (municipality: string) => void;
  moreLabel?: string;
  onClearSelection?: () => void;
  leading?: ReactNode;
}

const PREVIEW_COUNT = 3;

function pickPreview(
  cities: Array<[string, number]>,
  selected?: string,
  preferred?: string | null,
  limit = PREVIEW_COUNT,
): Array<[string, number]> {
  const picked: Array<[string, number]> = [];
  const used = new Set<string>();

  const add = (entry: [string, number] | undefined) => {
    if (!entry || used.has(entry[0]) || picked.length >= limit) {
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
  moreLabel,
  onClearSelection,
  leading,
}: MunicipalityChipsProps) {
  const [expanded, setExpanded] = useState(false);
  const cities = Object.entries(counts)
    .sort((a, b) => compareMunicipalityNames(a[0], b[0], preferred, counts))
    .slice(0, 24);

  if (cities.length < 2 && !leading) {
    return null;
  }

  const previewLimit = leading && moreLabel && selected
    ? 1
    : (leading || (moreLabel && selected) ? 2 : PREVIEW_COUNT);
  const visible = expanded ? cities : pickPreview(cities, selected, preferred, previewLimit);
  const hiddenCount = Math.max(0, cities.length - visible.length);

  const chipClass = (isActive: boolean, isPreferred: boolean) =>
    `inline-flex items-center gap-1 min-h-8 px-2.5 text-xs sm:text-sm rounded-full border whitespace-nowrap ${
      isActive
        ? 'bg-[#65BBE9] text-white border-transparent'
        : isPreferred
          ? 'bg-[#EBF6FC] text-gray-800 border-[#65BBE9]'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;

  return (
    <div className="mb-1.5">
      <p className="sr-only">市区町村で絞り込む</p>
      <div className={`flex flex-wrap gap-1.5 ${expanded ? 'max-h-20 overflow-y-auto overscroll-y-contain' : ''}`}>
        {leading}
        {visible.map(([name, count]) => {
          const isActive = selected === name;
          return (
            <button
              key={name}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setExpanded(false);
                onSelect(name);
              }}
              aria-pressed={isActive}
              aria-current={preferred === name ? 'true' : undefined}
              aria-label={`${name} ${count.toLocaleString()}件`}
              className={chipClass(isActive, preferred === name)}
            >
              {shortMunicipalityLabel(name, preferred)}
              <span className={isActive ? 'text-white/90' : 'text-gray-400'}>
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
        {moreLabel && selected && onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center min-h-8 px-2.5 text-xs sm:text-sm text-[#4AA8D9] rounded-full whitespace-nowrap hover:bg-[#EBF6FC]"
          >
            {moreLabel}
          </button>
        )}
        {!expanded && hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center min-h-8 px-2.5 text-xs sm:text-sm text-[#4AA8D9] rounded-full border border-transparent hover:bg-[#EBF6FC]"
          >
            {`ほか${hiddenCount}`}
          </button>
        )}
      </div>
      {expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="mt-1 inline-flex items-center min-h-8 px-2.5 text-xs sm:text-sm text-[#4AA8D9] rounded-full hover:bg-[#EBF6FC]"
        >
          とじる
        </button>
      )}
    </div>
  );
}
