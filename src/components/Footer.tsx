export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                className="text-pink-400 hover:text-pink-300 underline ml-1"
              >
                厚生労働省のページ
              </a>
              をご確認ください。
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-3">ご注意</h3>
            <ul className="text-sm space-y-2">
              <li>
                • 在庫状況や販売可能な薬剤師の勤務状況は変動します。訪問前に電話で確認することをお勧めします。
              </li>
              <li>
                • 緊急避妊薬は性交後72時間以内に服用することで効果が期待できます。
              </li>
              <li>
                • 体調に不安がある場合は、医療機関を受診してください。
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
          <p>
            データ出典:
            <a
              href="https://www.mhlw.go.jp/stf/kinnkyuuhininnyaku_00005.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 underline ml-1"
            >
              厚生労働省
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
