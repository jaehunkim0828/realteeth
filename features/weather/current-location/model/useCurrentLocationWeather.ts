'use client';

import { getWeatherByCoords } from '@/entities/weather/api/getWeatherByCoords';
import type { WeatherOkResponse } from '@/entities/weather/model/types';
import { useCallback, useEffect, useState } from 'react';

export function useCurrentLocationWeather() {
  const [weather, setWeather] = useState<WeatherOkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 기능을 사용할 수 없습니다.');
      return;
    }

    setError(null);
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const result = await getWeatherByCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setWeather(result);
        } catch (fetchError) {
          setWeather(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : '날씨 정보를 불러오지 못했습니다.'
          );
        } finally {
          setLoading(false);
        }
      },
      geolocationError => {
        setWeather(null);
        setError(geolocationError.message || '위치 권한이 필요합니다.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10_000 }
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { weather, loading, error, request };
}

