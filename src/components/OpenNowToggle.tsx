interface OpenNowToggleProps {
  pressed: boolean;
  onClick: () => void;
}

export function OpenNowToggle({ pressed, onClick }: OpenNowToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label="いま開局中の目安"
      className={`md:hidden shrink-0 inline-flex items-center min-h-8 px-2.5 text-xs sm:text-sm rounded-full border whitespace-nowrap ${
        pressed
          ? 'bg-[#65BBE9] text-white border-transparent'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      開局中
    </button>
  );
}
