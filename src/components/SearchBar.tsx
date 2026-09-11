interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = '店名・住所・電話',
}: SearchBarProps) {
  return (
    <div className="relative">
      <label htmlFor="pharmacy-search" className="sr-only">
        薬局名・住所・電話番号で検索
      </label>
      <input
        id="pharmacy-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="w-full pl-9 pr-9 py-2 md:pl-10 md:pr-10 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65BBE9] focus:border-transparent outline-none transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      <svg
        className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="検索キーワードをクリア"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
