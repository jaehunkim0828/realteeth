"use client";

import { getWeatherByCoords } from "@/entities/weather/api/getWeatherByCoords";
import type { WeatherOkResponse } from "@/entities/weather/model/types";
import {
  weatherQueryRefetchIntervalMs,
  weatherQueryStaleTimeMs,
} from "@/entities/weather/api/queryOptions";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export function useCurrentLocationWeather() {
  const [weather, setWeather] = useState<WeatherOkResponse | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocationError("이 브라우저에서는 위치 기능을 사용할 수 없습니다.");
      return;
    }

    setGeolocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (geolocationError) => {
        setWeather(null);
        setGeolocationError(
          geolocationError.message || "위치 권한이 필요합니다.",
        );
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  }, []);

  const query = useQuery({
    queryKey: coords
      ? ["weather", "coords", coords.lat, coords.lon]
      : ["weather", "coords", "none"],
    queryFn: async () => {
      if (!coords) throw new Error("coords not ready");
      return getWeatherByCoords(coords);
    },
    enabled: !!coords,
    staleTime: weatherQueryStaleTimeMs,
    refetchInterval: weatherQueryRefetchIntervalMs,
    refetchIntervalInBackground: true,
    gcTime: 1000 * 60 * 60 * 2,
  });

  useEffect(() => {
    request();
  }, [request]);

  useEffect(() => {
    if (query.data) setWeather(query.data);
  }, [query.data]);

  const error =
    geolocationError ??
    (query.error instanceof Error ? query.error.message : null);

  return {
    weather: query.data ?? weather,
    loading: query.isLoading,
    error,
    request,
  };
}
