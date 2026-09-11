import { useState } from 'react';

const DISMISS_KEY = 'supportBannerDismissed';

export function SupportBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') {
      return true;
    }
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, 'true');
  };

  if (dismissed) return null;

  return (
    <div className="mb-3 relative bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 flex items-center gap-2">
      <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <p className="flex-1 min-w-0 text-sm text-sky-800 overflow-hidden">
        <span className="whitespace-nowrap">
          <strong>#8103</strong>に相談できます
          <a
            href="https://www.npa.go.jp/higaisya/seihanzai/seihanzai.html"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-sky-600 hover:text-sky-800 underline"
          >
            詳しく
          </a>
        </span>
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 text-sky-400 hover:text-sky-600 rounded-full hover:bg-sky-100 transition-colors"
        aria-label="閉じる"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
