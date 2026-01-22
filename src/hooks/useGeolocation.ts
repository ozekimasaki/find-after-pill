import { useState, useCallback } from 'react';
import type { GeoLocation } from '../types/pharmacy';

interface UseGeolocationReturn {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  getCurrentLocation: () => void;
  clearLocation: () => void;
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
      setError('お使いのブラウザは位置情報に対応していません');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = '位置情報の取得に失敗しました';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = '位置情報を取得できませんでした';
            break;
          case err.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました';
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1分間キャッシュ
      }
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
