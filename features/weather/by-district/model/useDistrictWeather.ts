'use client';

import { geocodeDistrict } from '@/entities/district/api/geocodeDistrict';
import type { DistrictEntry } from '@/entities/district/lib/koreaDistricts';
import { getWeatherByCoords } from '@/entities/weather/api/getWeatherByCoords';
import type { WeatherOkResponse } from '@/entities/weather/model/types';
import { useEffect, useState } from 'react';

export function useDistrictWeather(selected: DistrictEntry | null) {
  const [weather, setWeather] = useState<WeatherOkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run(entry: DistrictEntry) {
      try {
        setError(null);
        setLoading(true);
        setWeather(null);

        const coords = await geocodeDistrict(entry);
        const result = await getWeatherByCoords(coords);
        if (cancelled) return;
        setWeather(result);
      } catch (fetchError) {
        if (cancelled) return;
        setWeather(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : '선택한 장소의 날씨를 불러오지 못했습니다.'
        );
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    if (selected) {
      void run(selected);
    } else {
      setWeather(null);
      setError(null);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [selected]);

  return { weather, loading, error };
}

