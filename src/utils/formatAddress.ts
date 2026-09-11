/**
 * 厚労省データの重複した住所を1回分に畳む。
 */
export function formatPharmacyAddress(address: string): string {
  const compact = address.normalize('NFKC').replace(/\s+/g, '');
  if (compact.length < 16) {
    return compact;
  }

  if (compact.length % 2 === 0) {
    const half = compact.length / 2;
    if (compact.slice(0, half) === compact.slice(half)) {
      return compact.slice(0, half);
    }
  }

  for (let size = Math.floor(compact.length / 2); size >= 10; size -= 1) {
    const tail = compact.slice(compact.length - size);
    const head = compact.slice(0, compact.length - size);
    if (head.endsWith(tail)) {
      return head;
    }
  }

  return compact;
}
