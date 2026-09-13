import { useEffect, useRef, type ReactNode } from 'react';
import { chipMunicipalityEntries, shortMunicipalityLabel } from '../utils/municipalityRank';

interface MunicipalityChipsProps {
  counts: Record<string, number>;
  selected?: string;
  preferred?: string | null;
  onSelect: (municipality: string) => void;
  moreLabel?: string;
  onClearSelection?: () => void;
  leading?: ReactNode;
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
  const selectedRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cities = chipMunicipalityEntries(counts, selected, preferred);

  useEffect(() => {
    const chip = selectedRef.current;
    const scroller = scrollerRef.current;
    if (!chip || !scroller) {
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const left = chip.offsetLeft - (scroller.clientWidth / 2) + (chip.offsetWidth / 2);
    scroller.scrollTo({
      left: Math.max(0, left),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [selected]);

  if (cities.length < 2 && !leading) {
    return null;
  }

  const labelContext = selected || preferred;
  const chipClass = (isActive: boolean, isPreferred: boolean) =>
    `inline-flex shrink-0 items-center gap-1 min-h-8 px-2.5 text-xs sm:text-sm rounded-full border whitespace-nowrap ${
      isActive
        ? 'bg-[#65BBE9] text-white border-transparent'
        : isPreferred
          ? 'bg-[#EBF6FC] text-gray-800 border-[#65BBE9]'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    }`;

  return (
    <div className="mb-1.5">
      <p className="sr-only">市区町村で絞り込む</p>
      <div className="flex items-center gap-1.5">
        {leading ? <div className="shrink-0">{leading}</div> : null}
        <div className="relative min-w-0 flex-1">
          <div ref={scrollerRef} className="flex gap-1.5 overflow-x-auto overscroll-x-contain filter-chip-scroll">
            {cities.map(([name, count]) => {
              const isActive = selected === name;
              return (
                <span key={name} className="contents">
                <button
                  type="button"
                  ref={isActive ? selectedRef : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(name)}
                  aria-pressed={isActive}
                  aria-current={preferred === name ? 'true' : undefined}
                  aria-label={`${name} ${count.toLocaleString()}件`}
                  className={chipClass(isActive, preferred === name)}
                >
                  {shortMunicipalityLabel(name, labelContext)}
                  <span className={isActive ? 'text-white/90' : 'text-gray-400'}>
                    {count.toLocaleString()}
                  </span>
                </button>
                {isActive && moreLabel && onClearSelection && (
                  <button
                    type="button"
                    onClick={onClearSelection}
                    className="inline-flex shrink-0 items-center min-h-8 px-2.5 text-xs sm:text-sm text-[#4AA8D9] rounded-full whitespace-nowrap hover:bg-[#EBF6FC]"
                  >
                    {moreLabel}
                  </button>
                )}
                </span>
              );
            })}
            {moreLabel && selected && onClearSelection && !cities.some(([name]) => name === selected) && (
              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex shrink-0 items-center min-h-8 px-2.5 text-xs sm:text-sm text-[#4AA8D9] rounded-full whitespace-nowrap hover:bg-[#EBF6FC]"
              >
                {moreLabel}
              </button>
            )}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-gray-50 to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
