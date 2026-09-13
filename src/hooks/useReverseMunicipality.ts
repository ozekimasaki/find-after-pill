import { useEffect, useState } from 'react';
import type { GeoLocation } from '../types/pharmacy';
import { reverseMunicipality } from '../utils/reverseMunicipality';

function locationKey(location: GeoLocation): string {
  return `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`;
}

export interface ReverseMunicipalityState {
  city: string | null;
  ready: boolean;
}

/**
 * 現在地から市区町村名を推定する。失敗時は city が null。
 */
export function useReverseMunicipality(location: GeoLocation | null): ReverseMunicipalityState {
  const [result, setResult] = useState<{ key: string; city: string | null } | null>(null);

  useEffect(() => {
    if (!location) {
      return;
    }

    const key = locationKey(location);
    const controller = new AbortController();
    reverseMunicipality(location.lat, location.lng, controller.signal)
      .then((city) => {
        if (!controller.signal.aborted) {
          setResult({ key, city });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ key, city: null });
        }
      });

    return () => controller.abort();
  }, [location]);

  if (!location) {
    return { city: null, ready: true };
  }

  const key = locationKey(location);
  if (result?.key === key) {
    return { city: result.city, ready: true };
  }
  return { city: null, ready: false };
}
