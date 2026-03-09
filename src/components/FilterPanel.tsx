import type { SearchParams } from '../types/pharmacy';

interface FilterPanelProps {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
}

const FILTERS = [
  {
    key: 'afterHoursOnly' as const,
    label: '夜間・休日も対応',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    key: 'noAdvanceCallRequired' as const,
    label: '予約なしで行ける',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    key: 'femalePharmacistOnly' as const,
    label: '女性の薬剤師がいる',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'hasPrivateSpace' as const,
    label: '個室あり',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
] as const;

export function FilterPanel({ searchParams, setSearchParams }: FilterPanelProps) {
  const activeCount = FILTERS.filter(f => searchParams[f.key]).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">絞り込み</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 text-xs font-medium bg-[#65BBE9] text-white rounded-full">
            {activeCount}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label, icon }) => {
          const isActive = !!searchParams[key];
          return (
            <button
              key={key}
              onClick={() => setSearchParams({ [key]: !isActive })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border active:scale-95 transition-all duration-150 ${
                isActive
                  ? 'bg-[#65BBE9] text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
