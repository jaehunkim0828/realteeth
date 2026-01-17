"use client";

import { geocodeDistrict } from "@/entities/district/api/geocodeDistrict";
import type { DistrictEntry } from "@/entities/district/lib/koreaDistricts";
import { getWeatherByCoords } from "@/entities/weather/api/getWeatherByCoords";
import {
  weatherQueryRefetchIntervalMs,
  weatherQueryStaleTimeMs,
} from "@/entities/weather/api/queryOptions";
import type { WeatherOkResponse } from "@/entities/weather/model/types";
import { useQuery } from "@tanstack/react-query";

export function useDistrictWeather(selected: DistrictEntry | null) {
  const geocodeQuery = useQuery({
    queryKey: selected
      ? ["geocode", "district", selected.raw]
      : ["geocode", "district", "none"],
    queryFn: async () => {
      if (!selected) throw new Error("district not selected");
      return geocodeDistrict(selected);
    },
    enabled: !!selected,
    staleTime: 1000 * 60 * 60 * 24 * 30,
    gcTime: 1000 * 60 * 60 * 24 * 30,
    retry: 1,
  });

  const coords = geocodeQuery.data ?? null;

  const weatherQuery = useQuery<WeatherOkResponse>({
    queryKey: coords
      ? ["weather", "district", coords.lat, coords.lon]
      : ["weather", "district", "none"],
    queryFn: async () => {
      if (!coords) throw new Error("coords not ready");
      return getWeatherByCoords(coords);
    },
    enabled: !!coords,
    staleTime: weatherQueryStaleTimeMs,
    refetchInterval: weatherQueryRefetchIntervalMs,
    refetchIntervalInBackground: true,
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
  });

  const loading = geocodeQuery.isFetching || weatherQuery.isFetching;
  const error =
    (geocodeQuery.error instanceof Error ? geocodeQuery.error.message : null) ??
    (weatherQuery.error instanceof Error ? weatherQuery.error.message : null);

  return {
    weather: weatherQuery.data ?? null,
    loading,
    error,
  };
}
