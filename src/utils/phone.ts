/**
 * tel: リンク用に電話番号を正規化する。
 * 複数番号がある場合は先頭のみを使う。
 */
export function toTelHref(phone: string): string {
  const first = phone.split(/[／/、,]/)[0]?.trim() ?? phone;
  const digits = first.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : `tel:${phone}`;
}
