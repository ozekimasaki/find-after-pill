import { useState, useEffect } from 'react';

const DISMISS_KEY = 'supportBannerDismissed';

export function SupportBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === 'true');
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, 'true');
  };

  if (dismissed) return null;

  return (
    <div className="animate-fadeIn mb-4 relative bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-start gap-3">
      <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-purple-800">
          つらい経験をされた方へ —{' '}
          <strong>#8103</strong>（ハートさん）に相談できます。
        </p>
        <a
          href="https://www.npa.go.jp/higaisya/seihanzai/seihanzai.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-600 hover:text-purple-800 underline mt-1 inline-block"
        >
          性犯罪被害相談窓口について詳しく見る
        </a>
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 text-purple-400 hover:text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
        aria-label="閉じる"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
