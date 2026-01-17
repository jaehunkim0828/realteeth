'use client';

import type { DistrictEntry } from '@/entities/district/lib/koreaDistricts';
import { formatPrecipitationType } from '@/entities/weather/model/types';
import { DistrictSearch } from '@/features/district-search/ui/DistrictSearch';
import { useDistrictWeather } from '@/features/weather/by-district/model/useDistrictWeather';
import { useCurrentLocationWeather } from '@/features/weather/current-location/model/useCurrentLocationWeather';
import { LocationPinIcon, StarIcon } from '@/shared/ui/icon';
import { useState } from 'react';

export function WeatherDashboard() {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictEntry | null>(null);

  const current = useCurrentLocationWeather();
  const selected = useDistrictWeather(selectedDistrict);

  return (
    <main className='py-10'>
      <h1 className='text-3xl font-semibold tracking-tight text-slate-900'>
        대한민국 날씨
      </h1>
      <p className='mt-2 text-sm text-slate-600'>
        현재 위치의 날씨를 확인하고, 행정구역을 검색해 즐겨찾기에 추가하세요.
      </p>

      <div className='mt-8 grid gap-6 lg:grid-cols-3'>
        <section className='space-y-6 lg:col-span-2'>
          <DistrictSearch
            selected={selectedDistrict}
            onSelect={setSelectedDistrict}
          />

          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
                  <LocationPinIcon className='h-4 w-4 text-slate-600' />
                  선택한 장소
                </div>
                <p className='mt-1 text-sm text-slate-600'>
                  검색 결과에서 선택한 장소의 날씨를 보여줍니다.
                </p>
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
              {!selectedDistrict ? (
                <p className='text-sm text-slate-600'>
                  검색창에서 장소를 선택해주세요.
                </p>
              ) : selected.loading ? (
                <p className='text-sm text-slate-600'>날씨 불러오는 중…</p>
              ) : selected.error ? (
                <p className='text-sm text-rose-600'>{selected.error}</p>
              ) : selected.weather ? (
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <div className='text-4xl font-semibold tracking-tight text-slate-900'>
                      {selected.weather.now.temperatureC ?? '-'}°
                    </div>
                    <div className='mt-1 text-sm text-slate-600'>
                      습도 {selected.weather.now.humidity ?? '-'}% · 풍속
                      {selected.weather.now.windSpeed ?? '-'}m/s
                    </div>
                  </div>

                  <div className='text-sm text-slate-700'>
                    <div>
                      강수{' '}
                      {formatPrecipitationType(
                        selected.weather.now.precipitationType
                      )}{' '}
                      · 1시간 {selected.weather.now.precipitation1h ?? '-'}mm
                    </div>
                    <div className='mt-1 text-xs text-slate-500'>
                      기준 {selected.weather.base.date}.{selected.weather.base.time}
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-slate-600'>
                  해당 장소의 정보가 제공되지 않습니다.
                </p>
              )}
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
                  <LocationPinIcon className='h-4 w-4 text-slate-600' />
                  현재 위치
                </div>
                <p className='mt-1 text-sm text-slate-600'>
                  위치 권한을 허용하면 현재 위치의 날씨를 보여줍니다.
                </p>
              </div>
            </div>

            <div className='mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
              {current.loading ? (
                <p className='text-sm text-slate-600'>날씨 불러오는 중…</p>
              ) : current.error ? (
                <p className='text-sm text-rose-600'>{current.error}</p>
              ) : current.weather ? (
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div>
                    <div className='text-4xl font-semibold tracking-tight text-slate-900'>
                      {current.weather.now.temperatureC ?? '-'}°
                    </div>
                    <div className='mt-1 text-sm text-slate-600'>
                      습도 {current.weather.now.humidity ?? '-'}% · 풍속
                      {current.weather.now.windSpeed ?? '-'}m/s
                    </div>
                  </div>

                  <div className='text-sm text-slate-700'>
                    <div>
                      강수{' '}
                      {formatPrecipitationType(
                        current.weather.now.precipitationType
                      )}{' '}
                      · 1시간 {current.weather.now.precipitation1h ?? '-'}mm
                    </div>
                    <div className='mt-1 text-xs text-slate-500'>
                      기준 {current.weather.base.date}.{current.weather.base.time}
                    </div>
                  </div>
                </div>
              ) : (
                <p className='text-sm text-slate-600'>
                  위치 권한이 필요합니다.
                </p>
              )}
            </div>
          </div>
        </section>

        <aside className='lg:col-span-1'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
                <StarIcon className='h-4 w-4 text-slate-600' />
                즐겨찾기
              </div>
              <span className='text-xs font-medium text-slate-500'>0 / 6</span>
            </div>

            <p className='mt-2 text-sm text-slate-600'>
              검색한 장소를 즐겨찾기에 추가하면 빠르게 확인할 수 있어요.
            </p>

            <div className='mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600'>
              아직 즐겨찾기가 없습니다.
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
