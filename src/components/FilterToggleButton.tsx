interface FilterToggleButtonProps {
  open: boolean;
  count: number;
  onClick: () => void;
}

export function FilterToggleButton({ open, count, onClick }: FilterToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative md:hidden shrink-0 inline-flex items-center justify-center w-10 h-10 text-[#4AA8D9] rounded-lg hover:bg-[#EBF6FC]"
      aria-expanded={open}
      aria-label={open ? '絞り込みを閉じる' : count > 0 ? `絞り込み、${count}件選択中` : '絞り込み'}
    >
      {open ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
        </svg>
      )}
      {!open && count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 text-[10px] leading-4 text-center text-white bg-[#65BBE9] rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
