import { PREFECTURES } from '../types/pharmacy';

interface PrefectureFilterProps {
  value: string;
  onChange: (prefecture: string) => void;
  counts?: Record<string, number>;
}

export function PrefectureFilter({ value, onChange, counts = {} }: PrefectureFilterProps) {
  return (
    <div className="relative">
      <label htmlFor="prefecture-select" className="sr-only">
        都道府県
      </label>
      <select
        id="prefecture-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-2.5 pr-7 md:pl-4 md:pr-10 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65BBE9] focus:border-transparent outline-none bg-white cursor-pointer truncate"
        aria-label="都道府県"
      >
        <option value="">全国</option>
        {PREFECTURES.map((pref) => (
          <option key={pref} value={pref}>
            {pref} {counts[pref] ? `(${counts[pref]})` : ''}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
