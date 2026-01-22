export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* このサイトについて */}
          <div>
            <h3 className="text-white font-bold mb-3">このサイトについて</h3>
            <p className="text-sm leading-relaxed">
              このサイトは厚生労働省が公開している「要指導医薬品である緊急避妊薬の販売が可能な薬局等の一覧」
              を元に、薬局を検索しやすくしたものです。
            </p>
            <p className="text-sm mt-2">
              データは定期的に更新されますが、最新の情報は
              <a
                href="https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#65BBE9] hover:text-[#EBF6FC] underline ml-1"
              >
                厚生労働省のページ
              </a>
              をご確認ください。
            </p>
          </div>

          {/* レボノルゲストレル（緊急避妊薬）について */}
          <div>
            <h3 className="text-white font-bold mb-3">緊急避妊薬について</h3>
            <ul className="text-sm space-y-1.5">
              <li>
                <span className="text-gray-400">薬効分類:</span> 緊急避妊剤
              </li>
              <li>
                <span className="text-gray-400">有効成分:</span> レボノルゲストレル 1.5mg
              </li>
              <li>
                <span className="text-gray-400">用法:</span> 性交後72時間以内に1回服用
              </li>
              <li>
                <span className="text-gray-400">妊娠阻止率:</span> 約81〜84%
              </li>
              <li>
                <span className="text-gray-400">主な副作用:</span> 消退出血、頭痛、悪心等
              </li>
            </ul>
            <p className="text-xs mt-2 text-gray-400">
              ※完全に妊娠を阻止できるわけではありません。計画的な避妊には経口避妊薬をご使用ください。
            </p>
            <a
              href="https://www.kegg.jp/medicus-bin/japic_med?japic_code=00067924"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-[#65BBE9] hover:text-[#EBF6FC] underline"
            >
              詳細情報（KEGG医薬品情報）
            </a>
          </div>

          {/* ご注意・相談窓口 */}
          <div>
            <h3 className="text-white font-bold mb-3">ご注意</h3>
            <ul className="text-sm space-y-2">
              <li>
                • 在庫状況や販売可能な薬剤師の勤務状況は変動します。訪問前に電話で確認することをお勧めします。
              </li>
              <li>
                • 体調に不安がある場合は、医療機関を受診してください。
              </li>
            </ul>

            {/* 相談窓口 */}
            <h3 className="text-white font-bold mt-6 mb-3">相談窓口</h3>
            <ul className="text-sm space-y-2">
              <li>
                <a
                  href="https://www.npa.go.jp/higaisya/seihanzai/seihanzai.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#65BBE9] hover:text-[#EBF6FC] underline"
                >
                  性犯罪被害相談電話 #8103（ハートさん）
                </a>
                <p className="text-xs text-gray-400 mt-0.5">警察庁 - 各都道府県警察の相談窓口</p>
              </li>
              <li>
                <a
                  href="https://www.gender.go.jp/policy/no_violence/date_dv/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#65BBE9] hover:text-[#EBF6FC] underline"
                >
                  デートDVって?
                </a>
                <p className="text-xs text-gray-400 mt-0.5">内閣府男女共同参画局</p>
              </li>
            </ul>
          </div>
        </div>

        {/* データ出典・コピーライト */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>
              データ出典:
              <a
                href="https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#65BBE9] hover:text-[#EBF6FC] underline ml-1"
              >
                厚生労働省
              </a>
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/mei_999_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#65BBE9] hover:text-[#EBF6FC] flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @mei_999_
              </a>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">© 2025 緊急避妊薬ナビ</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
