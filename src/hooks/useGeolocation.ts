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

function toErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return '位置情報の使用が許可されていません。ブラウザの設定を許可するか、都道府県から探してください';
    case err.POSITION_UNAVAILABLE:
      return '位置情報を取得できませんでした。都道府県から探すこともできます';
    case err.TIMEOUT:
      return '位置情報の取得がタイムアウトしました。都道府県から探すこともできます';
    default:
      return '位置情報の取得に失敗しました。都道府県から探すこともできます';
  }
}

/**
 * 現在地を取得するカスタムフック
 */
export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('お使いのブラウザは位置情報に対応していません。都道府県から探してください');
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

    const onLowAccuracyFailure = (err: GeolocationPositionError) => {
      setError(toErrorMessage(err));
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(toErrorMessage(err));
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
