'use client';

import { formatPrecipitationType } from '@/entities/weather/model/types';
import { getWeatherByCoords } from '@/entities/weather/api/getWeatherByCoords';
import type { FavoritePlace } from '@/entities/favorite/model/types';
import { useEffect, useState } from 'react';

function formatHour(hhmm: string) {
  const hh = hhmm.slice(0, 2);
  return `${hh}시`;
}

export function WeatherDetail({ place }: { place: FavoritePlace }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getWeatherByCoords>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        setLoading(true);
        const result = await getWeatherByCoords(place.coords);
        if (cancelled) return;
        setData(result);
      } catch (fetchError) {
        if (cancelled) return;
        setData(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : '날씨 정보를 불러오지 못했습니다.'
        );
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [place.coords.lat, place.coords.lon]);

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h1 className='text-2xl font-semibold tracking-tight text-slate-900'>
          {place.alias}
        </h1>
        <p className='mt-1 text-sm text-slate-600'>{place.label}</p>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        {loading ? (
          <p className='text-sm text-slate-600'>날씨 불러오는 중…</p>
        ) : error ? (
          <p className='text-sm text-rose-600'>{error}</p>
        ) : data ? (
          <div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <div className='text-5xl font-semibold tracking-tight text-slate-900'>
                  {data.now.temperatureC ?? '-'}°
                </div>
                <div className='mt-2 text-sm text-slate-700'>
                  오늘 최저 {data.today.minC ?? '-'}° · 최고{' '}
                  {data.today.maxC ?? '-'}°
                </div>
                <div className='mt-1 text-sm text-slate-700'>
                  습도 {data.now.humidity ?? '-'}% · 풍속 {data.now.windSpeed ?? '-'}
                  m/s
                </div>
                <div className='mt-1 text-sm text-slate-700'>
                  강수 {formatPrecipitationType(data.now.precipitationType)} · 1시간{' '}
                  {data.now.precipitation1h ?? '-'}mm
                </div>
                <div className='mt-2 text-xs text-slate-500'>
                  기준 {data.base.date}.{data.base.time}
                </div>
              </div>

              <div>
                <div className='text-sm font-semibold text-slate-900'>시간대 별 기온</div>
                {data.hourly.length === 0 ? (
                  <p className='mt-2 text-sm text-slate-600'>
                    해당 장소의 정보가 제공되지 않습니다.
                  </p>
                ) : (
                  <div className='mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4'>
                    {data.hourly.slice(0, 24).map(item => (
                      <div
                        key={item.time}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm'
                      >
                        <div className='text-xs text-slate-600'>
                          {formatHour(item.time)}
                        </div>
                        <div className='mt-1 text-sm font-semibold text-slate-900'>
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
          <p className='text-sm text-slate-600'>해당 장소의 정보가 제공되지 않습니다.</p>
        )}
      </div>
    </div>
  );
}
