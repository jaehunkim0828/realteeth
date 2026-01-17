"use client";

import { formatPrecipitationType } from "@/entities/weather/model/types";
import { getWeatherByCoords } from "@/entities/weather/api/getWeatherByCoords";
import type { FavoritePlace } from "@/entities/favorite/model/types";
import {
  weatherQueryRefetchIntervalMs,
  weatherQueryStaleTimeMs,
} from "@/entities/weather/api/queryOptions";
import { useQuery } from "@tanstack/react-query";

function formatHour(hhmm: string) {
  const hh = hhmm.slice(0, 2);
  return `${hh}시`;
}

export function WeatherDetail({ place }: { place: FavoritePlace }) {
  const query = useQuery({
    queryKey: ["weather", "detail", place.coords.lat, place.coords.lon],
    queryFn: () => getWeatherByCoords(place.coords),
    staleTime: weatherQueryStaleTimeMs,
    refetchInterval: weatherQueryRefetchIntervalMs,
    refetchIntervalInBackground: true,
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {place.alias}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{place.label}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {query.isLoading ? (
          <p className="text-sm text-slate-600">날씨 불러오는 중…</p>
        ) : query.isError ? (
          <p className="text-sm text-rose-600">
            {query.error instanceof Error
              ? query.error.message
              : "날씨 정보를 불러오지 못했습니다."}
          </p>
        ) : query.data ? (
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-5xl font-semibold tracking-tight text-slate-900">
                  {query.data.now.temperatureC ?? "-"}°
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  오늘 최저 {query.data.today.minC ?? "-"}° · 최고{" "}
                  {query.data.today.maxC ?? "-"}°
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  습도 {query.data.now.humidity ?? "-"}% · 풍속{" "}
                  {query.data.now.windSpeed ?? "-"}
                  m/s
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  강수{" "}
                  {formatPrecipitationType(query.data.now.precipitationType)} ·
                  1시간 {query.data.now.precipitation1h ?? "-"}mm
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  기준 {query.data.base.date}.{query.data.base.time}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">
                  시간대 별 기온
                </div>
                {query.data.hourly.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-600">
                    해당 장소의 정보가 제공되지 않습니다.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {query.data.hourly.slice(0, 24).map((item) => (
                      <div
                        key={item.time}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm"
                      >
                        <div className="text-xs text-slate-600">
                          {formatHour(item.time)}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          {item.temperatureC}°
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            해당 장소의 정보가 제공되지 않습니다.
          </p>
        )}
      </div>
    </div>
  );
}
