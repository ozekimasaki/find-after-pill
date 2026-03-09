import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: '緊急避妊薬（アフターピル）はどこで買えますか？',
    answer:
      '2024年11月28日から、処方箋なしで一部の薬局で購入できるようになりました。厚生労働省が公開している販売可能な薬局一覧に掲載されている薬局で購入できます。当サイトでは、現在地や都道府県から対象の薬局を検索できます。',
  },
  {
    question: 'ノルレボとレソエル72の違いは何ですか？',
    answer:
      'ノルレボ（Norlevo）とレソエル72（Lesoeru72）はどちらもレボノルゲストレル1.5mgを有効成分とする緊急避妊薬です。ノルレボは先発医薬品、レソエル72は後発医薬品（ジェネリック）です。効果や用法は同じですが、価格はレソエル72のほうが安い場合があります。',
  },
  {
    question: '緊急避妊薬の値段はいくらですか？',
    answer:
      '薬局での販売価格は7,000円〜9,000円程度が目安です（税込）。処方箋なしで購入する場合は自費となります。価格は薬局によって異なりますので、事前に電話で確認することをお勧めします。',
  },
  {
    question: '薬局でアフターピルを買う際の流れは？',
    answer:
      '対象の薬局を訪問し、薬剤師に緊急避妊薬の購入希望を伝えます。個室やパーテーションで区切られた場所で薬剤師による確認・説明を受けた後、その場で服用します。本人確認書類（運転免許証、マイナンバーカード等）が必要です。',
  },
  {
    question: '緊急避妊薬はいつまでに飲めばいいですか？',
    answer:
      '性交後72時間（3日）以内に服用する必要があります。服用が早いほど効果が高く、24時間以内の服用で妊娠阻止率は約95%、72時間以内では約81〜84%とされています。できるだけ早く服用することが重要です。',
  },
  {
    question: '緊急避妊薬に年齢制限はありますか？',
    answer:
      '薬局での購入には年齢制限があり、16歳以上が対象です。16歳未満の方は医療機関を受診し、医師の処方を受ける必要があります。また、18歳未満の場合は保護者の同意が求められる場合があります。',
  },
  {
    question: '薬局で恥ずかしい思いをしませんか？',
    answer:
      '対応する薬剤師はプライバシーに配慮した研修を受けています。個室やパーテーションで区切られた場所で、他のお客さんに聞こえないように対応してもらえます。緊急避妊薬を求めることは恥ずかしいことではありません。',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">
        よくある質問
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        はじめての方も安心してください。よくある疑問をまとめました。
      </p>
      <div className="divide-y divide-gray-200">
        {faqItems.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65BBE9] rounded"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-gray-800 pr-4">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="pb-4 text-gray-600 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
