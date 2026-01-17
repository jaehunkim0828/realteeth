'use client';

import type { DistrictEntry } from '@/entities/district/lib/koreaDistricts';
import { formatPrecipitationType } from '@/entities/weather/model/types';
import { DistrictSearch } from '@/features/district-search/ui/DistrictSearch';
import { useFavorites } from '@/features/favorites/model/useFavorites';
import { FavoriteList } from '@/features/favorites/ui/FavoriteList';
import { useDistrictWeather } from '@/features/weather/by-district/model/useDistrictWeather';
import { useCurrentLocationWeather } from '@/features/weather/current-location/model/useCurrentLocationWeather';
import { LocationPinIcon, StarIcon } from '@/shared/ui/icon';
import { useState } from 'react';

function formatHour(hhmm: string) {
  const hh = hhmm.slice(0, 2);
  return `${hh}시`;
}

function HourlyTemperatureRow({
  hourly,
}: {
  hourly: Array<{ time: string; temperatureC: number }>;
}) {
  const trimmed = hourly.slice(0, 12);
  if (trimmed.length === 0) return null;

  return (
    <div className='mt-4 w-full max-w-full'>
      <div className='text-xs font-semibold tracking-wide text-slate-500'>
        시간대별 기온
      </div>
      <div className='mt-2 w-full min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x'>
        <div className='flex w-max gap-2'>
          {trimmed.map(item => (
            <div
              key={item.time}
              className='w-16 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm'
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
      </div>
    </div>
  );
}

export function WeatherDashboard() {
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictEntry | null>(null);
  const [favoriteActionError, setFavoriteActionError] = useState<string | null>(
    null
  );

  const current = useCurrentLocationWeather();
  const selected = useDistrictWeather(selectedDistrict);
  const favorites = useFavorites();

  return (
    <main className='py-10'>
      <div className='mx-auto max-w-6xl px-0 sm:px-6 lg:px-8'>
        <h1 className='text-3xl font-semibold tracking-tight text-slate-900'>
          대한민국 날씨
        </h1>
        <p className='mt-2 text-sm text-slate-600'>
          현재 위치의 날씨를 확인하고, 행정구역을 검색해 즐겨찾기에 추가하세요.
        </p>

        <div className='mt-8 flex flex-col gap-6  lg:grid grid-cols-3'>
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

              <div className='mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
                {!selectedDistrict ? (
                  <p className='text-sm text-slate-600'>
                    검색창에서 장소를 선택해주세요.
                  </p>
                ) : selected.loading ? (
                  <p className='text-sm text-slate-600'>날씨 불러오는 중…</p>
                ) : selected.error ? (
                  <p className='text-sm text-rose-600'>{selected.error}</p>
                ) : selected.weather ? (
                  <div>
                    <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
                      <div className='text-xs font-semibold tracking-wide text-slate-500'>
                        즐겨찾기에 저장
                      </div>
                      <button
                        type='button'
                        disabled={
                          !favorites.hydrated ||
                          !selectedDistrict ||
                          !favorites.canAdd ||
                          favorites.isFavorite(selectedDistrict)
                        }
                        onClick={async () => {
                          if (!selectedDistrict) return;
                          try {
                            setFavoriteActionError(null);
                            await favorites.addFromDistrict(selectedDistrict);
                          } catch (error) {
                            setFavoriteActionError(
                              error instanceof Error
                                ? error.message
                                : '추가할 수 없습니다.'
                            );
                          }
                        }}
                        className='inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:h-9 sm:w-auto'
                      >
                        <StarIcon className='h-4 w-4 text-white' />
                        즐겨찾기 추가
                      </button>
                    </div>

                    {favoriteActionError ? (
                      <p className='mb-3 text-sm text-rose-600'>
                        {favoriteActionError}
                      </p>
                    ) : null}

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div>
                        <div className='text-4xl font-semibold tracking-tight text-slate-900'>
                          {selected.weather.now.temperatureC ?? '-'}°
                        </div>
                        <div className='mt-1 text-sm text-slate-600'>
                          최저 {selected.weather.today.minC ?? '-'}° · 최고
                          {selected.weather.today.maxC ?? '-'}°
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
                          · 1시간 {selected.weather.now.precipitation1h ?? '-'}
                          mm
                        </div>
                        <div className='mt-1 text-xs text-slate-500'>
                          기준 {selected.weather.base.date}.
                          {selected.weather.base.time}
                        </div>
                      </div>
                    </div>

                    <HourlyTemperatureRow hourly={selected.weather.hourly} />
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

              <div className='mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
                {current.loading ? (
                  <p className='text-sm text-slate-600'>날씨 불러오는 중…</p>
                ) : current.error ? (
                  <p className='text-sm text-rose-600'>{current.error}</p>
                ) : current.weather ? (
                  <div>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div>
                        <div className='text-4xl font-semibold tracking-tight text-slate-900'>
                          {current.weather.now.temperatureC ?? '-'}°
                        </div>
                        <div className='mt-1 text-sm text-slate-600'>
                          최저 {current.weather.today.minC ?? '-'}° · 최고
                          {current.weather.today.maxC ?? '-'}°
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
                          기준 {current.weather.base.date}.
                          {current.weather.base.time}
                        </div>
                      </div>
                    </div>

                    <HourlyTemperatureRow hourly={current.weather.hourly} />
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
                <span className='text-xs font-medium text-slate-500'>
                  <span suppressHydrationWarning>
                    {favorites.hydrated ? favorites.count : '—'}
                  </span>{' '}
                  / 6
                </span>
              </div>

              <p className='mt-2 text-sm text-slate-600'>
                검색한 장소를 즐겨찾기에 추가하면 빠르게 확인할 수 있어요.
              </p>

              <div className='mt-4'>
                <div className='mt-3'>
                  <FavoriteList
                    items={favorites.items}
                    max={6}
                    onRemove={favorites.remove}
                    onUpdateAlias={favorites.updateAlias}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
