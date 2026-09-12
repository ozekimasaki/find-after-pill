import { MUNICIPALITY_NEIGHBORS } from '../data/municipalityNeighbors';
import { designatedCityName } from './municipality';

export function parentCityName(name: string): string | null {
  const match = name.match(/^(.+?市)/);
  return match?.[1] ?? null;
}

export function shortMunicipalityLabel(name: string, context?: string | null): string {
  if (!context) {
    return name;
  }

  const parent = parentCityName(name);
  if (!parent) {
    return name;
  }

  const contextParent = parentCityName(context) ?? context;
  const sameCity = context === name || context.startsWith(parent) || contextParent === parent;
  if (!sameCity) {
    return name;
  }

  const rest = name.slice(parent.length);
  return rest || name;
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

/**
 * 政令市の区は親の市に畳み、選んだ市の中だけ区チップを出す。
 */
export function chipMunicipalityEntries(
  counts: Record<string, number>,
  selected?: string,
  preferred?: string | null,
): Array<[string, number]> {
  const parentTotals: Record<string, number> = {};
  const wardCountByParent: Record<string, number> = {};
  for (const [name, count] of Object.entries(counts)) {
    const parent = designatedCityName(name);
    if (!parent) {
      continue;
    }
    parentTotals[parent] = (parentTotals[parent] || 0) + count;
    wardCountByParent[parent] = (wardCountByParent[parent] || 0) + 1;
  }

  const collapsedParents = new Set(
    Object.entries(wardCountByParent)
      .filter(([, wardCount]) => wardCount >= 2)
      .map(([parent]) => parent),
  );

  const selectedParent = selected
    ? (collapsedParents.has(selected) ? selected : designatedCityName(selected))
    : null;
  const expandParent = selectedParent && collapsedParents.has(selectedParent)
    ? selectedParent
    : null;

  const next: Record<string, number> = {};
  for (const [name, count] of Object.entries(counts)) {
    const parent = designatedCityName(name);
    if (parent && collapsedParents.has(parent) && expandParent !== parent) {
      continue;
    }
    next[name] = count;
  }
  for (const parent of collapsedParents) {
    next[parent] = parentTotals[parent];
  }

  return Object.entries(next).sort((a, b) =>
    compareMunicipalityNames(a[0], b[0], preferred || selected || null, next),
  );
}
