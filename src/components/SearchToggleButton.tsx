interface SearchToggleButtonProps {
  open: boolean;
  active?: boolean;
  onClick: () => void;
  labeled?: boolean;
}

export function SearchToggleButton({
  open,
  active = false,
  onClick,
  labeled = false,
}: SearchToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative md:hidden shrink-0 inline-flex items-center justify-center gap-0.5 text-[#4AA8D9] rounded-lg hover:bg-[#EBF6FC] ${
        labeled ? 'h-8 px-2' : 'w-8 h-8'
      } ${open ? 'bg-[#EBF6FC]' : ''}`}
      aria-expanded={open}
      aria-controls="pharmacy-search"
      aria-label={open ? '店名検索を閉じる' : '店名・住所・電話で探す'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {labeled && (
        <span className="text-xs font-medium" aria-hidden="true">
          店名
        </span>
      )}
      {!open && active && (
        <span className={`absolute w-2 h-2 bg-[#65BBE9] rounded-full ${labeled ? 'top-0.5 right-0.5' : 'top-1.5 right-1.5'}`} />
      )}
    </button>
  );
}
