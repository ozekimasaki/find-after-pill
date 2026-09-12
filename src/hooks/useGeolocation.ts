import { useState, useCallback } from 'react';
import type { GeoLocation } from '../types/pharmacy';

interface UseGeolocationReturn {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  getCurrentLocation: () => void;
  clearLocation: () => void;
}

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 60000,
};

const LOW_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 300000,
};

const LOCATION_FALLBACK_MESSAGE = '都道府県から探してください';

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(LOCATION_FALLBACK_MESSAGE);
      return;
    }

    setLoading(true);
    setError(null);

    const onSuccess = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
      setLoading(false);
    };

    const onLowAccuracyFailure = () => {
      setError(LOCATION_FALLBACK_MESSAGE);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(LOCATION_FALLBACK_MESSAGE);
          setLoading(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onLowAccuracyFailure,
          LOW_ACCURACY_OPTIONS
        );
      },
      HIGH_ACCURACY_OPTIONS
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    clearLocation,
  };
}
