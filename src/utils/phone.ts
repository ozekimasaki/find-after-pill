/**
 * tel: リンク用に電話番号を正規化する。
 * 複数番号がある場合は先頭のみを使う。
 */
export function toTelHref(phone: string): string {
  const first = splitPhoneNumbers(phone)[0] ?? phone;
  const digits = first.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : `tel:${phone}`;
}

function splitPhoneNumbers(phone: string): string[] {
  return phone
    .split(/[／/、,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const FIVE_DIGIT_AREA_CODES = new Set([
  '01267', '01372', '01374', '01377', '01392', '01397', '01398',
  '01456', '01457', '01466', '01547', '01558', '01564', '01586', '01587',
  '01632', '01634', '01635', '01648', '01654', '01655', '01656', '01658',
  '04992', '04994', '05769', '07468', '08387', '08388', '08477',
  '08512', '08514', '09496', '09802', '09912', '09913', '09969',
]);

const FOUR_DIGIT_AREA_CODES = new Set(
  `
  0123 0124 0125 0126 0133 0134 0135 0136 0137 0138 0139
  0142 0143 0144 0145 0146 0152 0153 0154 0155 0156 0157 0158
  0162 0163 0164 0165 0166 0167 0172 0173 0174 0175 0176 0178 0179
  0182 0183 0184 0185 0186 0187 0191 0192 0193 0194 0195 0197 0198
  0220 0223 0224 0225 0226 0228 0229 0233 0234 0235 0237 0238
  0240 0241 0242 0243 0244 0246 0247 0248 0250 0254 0255 0256 0257 0258 0259
  0260 0261 0263 0264 0265 0266 0267 0268 0269 0270 0274 0276 0277 0278 0279
  0280 0282 0283 0284 0285 0287 0288 0289 0291 0293 0294 0295 0296 0297 0299
  0422 0428 0436 0438 0439 0460 0463 0465 0466 0467 0470 0475 0476 0478 0479
  0480 0493 0494 0495
  0531 0532 0533 0536 0537 0538 0539 0544 0545 0547 0548
  0550 0551 0553 0554 0555 0556 0557 0558
  0561 0562 0563 0564 0565 0566 0567 0568 0569
  0572 0573 0574 0575 0576 0577 0578 0581 0584 0585 0586 0587
  0594 0595 0596 0597 0598 0599
  0721 0725 0735 0736 0737 0738 0739 0740 0742 0743 0744 0745 0746 0747 0748 0749
  0761 0763 0765 0766 0767 0768 0770 0772 0773 0774 0776 0778 0779
  0790 0791 0794 0795 0796 0797 0798
  0823 0824 0826 0827 0829 0833 0834 0835 0836 0837 0838 0845 0846 0847 0848
  0852 0853 0854 0855 0856 0857 0858 0859 0863 0865 0866 0867 0868 0869
  0875 0877 0879 0880 0883 0884 0885 0887 0889
  0892 0893 0894 0895 0896 0897 0898
  0920 0930 0940 0942 0943 0944 0946 0947 0948 0949
  0950 0952 0954 0955 0956 0957 0959
  0964 0965 0966 0967 0968 0969 0972 0973 0974 0978 0979
  0980 0982 0983 0984 0985 0986 0987 0993 0994 0995 0996 0997
  `.trim().split(/\s+/)
);

const THREE_DIGIT_AREA_CODES = new Set([
  '011', '017', '018', '019', '022', '023', '024', '025', '026', '027', '028', '029',
  '042', '043', '044', '045', '046', '047', '048', '049',
  '052', '053', '054', '055', '058', '059',
  '072', '073', '075', '076', '077', '078', '079',
  '082', '083', '084', '086', '087', '088', '089',
  '092', '093', '095', '096', '097', '098', '099',
]);

function hyphenateDigits(digits: string, groups: number[]): string {
  const parts: string[] = [];
  let cursor = 0;
  for (const size of groups) {
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  if (cursor < digits.length) {
    parts.push(digits.slice(cursor));
  }
  return parts.filter(Boolean).join('-');
}

function formatLandline(digits: string): string {
  if (digits.startsWith('0120') || digits.startsWith('0800') || digits.startsWith('0570')) {
    return hyphenateDigits(digits, [4, 3, 3]);
  }

  if (digits.startsWith('03') || digits.startsWith('06')) {
    return hyphenateDigits(digits, [2, 4, 4]);
  }

  const five = digits.slice(0, 5);
  if (FIVE_DIGIT_AREA_CODES.has(five)) {
    return hyphenateDigits(digits, [5, 1, 4]);
  }

  const four = digits.slice(0, 4);
  if (FOUR_DIGIT_AREA_CODES.has(four)) {
    return hyphenateDigits(digits, [4, 2, 4]);
  }

  const three = digits.slice(0, 3);
  if (THREE_DIGIT_AREA_CODES.has(three)) {
    return hyphenateDigits(digits, [3, 3, 4]);
  }

  return hyphenateDigits(digits, [3, 3, 4]);
}

function formatOne(phone: string): string {
  if (!phone) {
    return phone;
  }

  if (/^\d[\d\-()（）\s]+$/.test(phone) && /[-−ー]/.test(phone)) {
    return phone.replace(/[−ー]/g, '-');
  }

  const digits = phone.replace(/[^\d]/g, '');
  if (!digits) {
    return phone;
  }

  if (/^(070|080|090|050)/.test(digits) && digits.length === 11) {
    return hyphenateDigits(digits, [3, 4, 4]);
  }

  if (digits.length === 10 && digits.startsWith('0')) {
    return formatLandline(digits);
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return hyphenateDigits(digits, [3, 4, 4]);
  }

  return phone;
}

/**
 * 画面表示用に日本の電話番号をハイフン区切りにする。
 * 複数番号は「 / 」でつなぐ。市外局番は最長一致。
 */
export function formatPhoneDisplay(phone: string): string {
  const parts = splitPhoneNumbers(phone);
  if (parts.length === 0) {
    return phone;
  }
  return parts.map(formatOne).join(' / ');
}
