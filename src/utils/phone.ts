/**
 * tel: リンク用に電話番号を正規化する。
 * 複数番号がある場合は先頭のみを使う。
 */
export function toTelHref(phone: string): string {
  const first = phone.split(/[／/、,]/)[0]?.trim() ?? phone;
  const digits = first.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : `tel:${phone}`;
}

function primaryNumber(phone: string): string {
  return phone.split(/[／/、,]/)[0]?.trim() ?? phone;
}

/**
 * 画面表示用に日本の電話番号をハイフン区切りにする。
 * 市外局番の完全な辞書は持たず、よくある桁割りに寄せる。
 */
export function formatPhoneDisplay(phone: string): string {
  const first = primaryNumber(phone);
  if (!first) {
    return phone;
  }

  if (/^\d[\d\-()（）\s]+$/.test(first) && /[-−ー]/.test(first)) {
    return first.replace(/[−ー]/g, '-');
  }

  const digits = first.replace(/[^\d]/g, '');
  if (!digits) {
    return phone;
  }

  if (/^(070|080|090|050)/.test(digits) && digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if ((digits.startsWith('0120') || digits.startsWith('0800')) && digits.length === 10) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  if ((digits.startsWith('03') || digits.startsWith('06')) && digits.length === 10) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return first;
}
