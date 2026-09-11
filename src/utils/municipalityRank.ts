import { MUNICIPALITY_NEIGHBORS } from '../data/municipalityNeighbors';

export function parentCityName(name: string): string | null {
  const match = name.match(/^(.+?市)/);
  return match?.[1] ?? null;
}

export function shortMunicipalityLabel(name: string, context?: string | null): string {
  if (!context) {
    return name;
  }

  const parent = parentCityName(name);
  const contextParent = parentCityName(context);
  if (parent && contextParent && parent === contextParent) {
    return name.slice(parent.length) || name;
  }

  return name;
}

function proximityRank(preferred: string, name: string): number {
  if (name === preferred) {
    return -1;
  }

  const neighbors = MUNICIPALITY_NEIGHBORS[preferred];
  if (neighbors) {
    const index = neighbors.indexOf(name);
    if (index >= 0) {
      return index;
    }
  }

  const parent = parentCityName(preferred);
  if (parent && name.startsWith(parent)) {
    return 100;
  }

  return 1000;
}

export function compareMunicipalityNames(
  a: string,
  b: string,
  preferred: string | null | undefined,
  counts: Record<string, number>,
): number {
  if (preferred) {
    const rankA = proximityRank(preferred, a);
    const rankB = proximityRank(preferred, b);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
  }

  const countDelta = (counts[b] || 0) - (counts[a] || 0);
  if (countDelta !== 0) {
    return countDelta;
  }

  return a.localeCompare(b, 'ja');
}
