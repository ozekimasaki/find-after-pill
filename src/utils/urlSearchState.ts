import type { SearchParams } from '../types/pharmacy';

export type ViewMode = 'list' | 'map';

export const RADIUS_OPTIONS = [3, 5, 10, 20, 50] as const;
export const DEFAULT_RADIUS = 10;

export interface UrlSearchState {
  searchParams: SearchParams;
  viewMode: ViewMode;
  radius: number;
  hasExplicitHours: boolean;
}

function parseFlag(value: string | null): boolean {
  return value === '1';
}

export function parseUrlSearchState(search = window.location.search): UrlSearchState {
  const params = new URLSearchParams(search);
  const searchParams: SearchParams = {};

  const query = params.get('q')?.trim();
  if (query) {
    searchParams.query = query;
  }

  const prefecture = params.get('pref')?.trim();
  if (prefecture) {
    searchParams.prefecture = prefecture;
  }

  const hasExplicitHours = params.has('hours');
  if (hasExplicitHours) {
    searchParams.afterHoursOnly = parseFlag(params.get('hours'));
  }

  if (parseFlag(params.get('walkin'))) {
    searchParams.noAdvanceCallRequired = true;
  }
  if (parseFlag(params.get('female'))) {
    searchParams.femalePharmacistOnly = true;
  }
  if (parseFlag(params.get('room'))) {
    searchParams.hasPrivateSpace = true;
  }

  const radiusRaw = Number(params.get('radius'));
  const radius = (RADIUS_OPTIONS as readonly number[]).includes(radiusRaw)
    ? radiusRaw
    : DEFAULT_RADIUS;
  if ((RADIUS_OPTIONS as readonly number[]).includes(radiusRaw)) {
    searchParams.radius = radius;
  }

  const viewMode: ViewMode = params.get('view') === 'map' ? 'map' : 'list';

  return { searchParams, viewMode, radius, hasExplicitHours };
}

export function replaceUrlSearchState(state: {
  searchParams: SearchParams;
  viewMode: ViewMode;
  hasLocation: boolean;
  persistHoursOff: boolean;
}): void {
  const params = new URLSearchParams();
  const { searchParams, viewMode, hasLocation, persistHoursOff } = state;

  if (searchParams.query) {
    params.set('q', searchParams.query);
  }
  if (searchParams.prefecture) {
    params.set('pref', searchParams.prefecture);
  }
  if (searchParams.afterHoursOnly) {
    params.set('hours', '1');
  } else if (persistHoursOff) {
    params.set('hours', '0');
  }
  if (searchParams.noAdvanceCallRequired) {
    params.set('walkin', '1');
  }
  if (searchParams.femalePharmacistOnly) {
    params.set('female', '1');
  }
  if (searchParams.hasPrivateSpace) {
    params.set('room', '1');
  }
  if (hasLocation && searchParams.radius && searchParams.radius !== DEFAULT_RADIUS) {
    params.set('radius', String(searchParams.radius));
  }
  if (viewMode === 'map') {
    params.set('view', 'map');
  }

  const qs = params.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState(null, '', next);
  }
}
