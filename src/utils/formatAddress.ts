/**
 * 厚労省データの重複した住所を1回分に畳む。
 */
export function formatPharmacyAddress(
  address: string,
  prefecture?: string,
  municipality?: string,
): string {
  const compact = address.normalize('NFKC').replace(/\s+/g, '');
  let folded = compact;

  if (compact.length >= 16) {
    if (compact.length % 2 === 0) {
      const half = compact.length / 2;
      if (compact.slice(0, half) === compact.slice(half)) {
        folded = compact.slice(0, half);
      }
    }

    if (folded === compact) {
      for (let size = Math.floor(compact.length / 2); size >= 10; size -= 1) {
        const tail = compact.slice(compact.length - size);
        const head = compact.slice(0, compact.length - size);
        if (head.endsWith(tail)) {
          folded = head;
          break;
        }
      }
    }
  }

  let result = folded;
  if (prefecture && result.startsWith(prefecture)) {
    result = result.slice(prefecture.length);
  }
  if (municipality && result.startsWith(municipality)) {
    result = result.slice(municipality.length);
  }
  return result || folded;
}
