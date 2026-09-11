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
        className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#65BBE9] focus:border-transparent outline-none bg-white cursor-pointer"
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
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
