'use client';

import {
  LocationPinIcon,
  SearchIcon,
  StarIcon,
} from '@/shared/ui/icon';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import {
  buildDistrictIndex,
  searchDistricts,
  type DistrictEntry,
} from '@/entities/district/lib/koreaDistricts';

export function WeatherDashboard() {
  const [districtIndex, setDistrictIndex] = useState<DistrictEntry[] | null>(
    null
  );
  const [districtError, setDistrictError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictEntry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/data/korea_districts.json');
        if (!response.ok) {
          throw new Error(`행정구역 데이터 로드 실패 (${response.status})`);
        }

        const json = (await response.json()) as unknown;
        if (!Array.isArray(json)) {
          throw new Error('행정구역 데이터 형식이 올바르지 않습니다.');
        }

        const list = json.filter((v): v is string => typeof v === 'string');
        if (cancelled) return;
        setDistrictIndex(buildDistrictIndex(list));
      } catch (error) {
        if (cancelled) return;
        setDistrictError(
          error instanceof Error
            ? error.message
            : '행정구역 데이터를 불러오지 못했습니다.'
        );
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewDistricts = useMemo(() => {
    if (!districtIndex) return [];
    return districtIndex.filter(d => d.parts.length === 1).slice(0, 8);
  }, [districtIndex]);

  const suggestions = useMemo(() => {
    if (!districtIndex) return [];
    return searchDistricts(districtIndex, deferredQuery, 8);
  }, [districtIndex, deferredQuery]);

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
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
                  <SearchIcon className='h-4 w-4 text-slate-600' />
                  장소 검색
                </div>
                <p className='mt-1 text-sm text-slate-600'>
                  예) 서울특별시, 종로구, 청운동
                </p>
              </div>
            </div>

            <div className='mt-4'>
              <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-sky-400'>
                <SearchIcon className='h-4 w-4 text-slate-500' />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  className='w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none'
                  placeholder='대한민국 행정구역을 입력하세요'
                />
              </div>

              <div className='mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm'>
                {districtError ? (
                  <p className='text-rose-600'>{districtError}</p>
                ) : !districtIndex ? (
                  <p className='text-slate-600'>
                    행정구역 데이터를 불러오는 중…
                  </p>
                ) : query.trim() ? (
                  <div>
                    <div className='mb-2 text-xs font-semibold tracking-wide text-slate-500'>
                      검색 미리보기
                    </div>
                    {suggestions.length === 0 ? (
                      <p className='text-slate-600'>
                        일치하는 장소가 없습니다.
                      </p>
                    ) : (
                      <ul className='space-y-1'>
                        {suggestions.map(item => (
                          <li key={item.raw}>
                            <button
                              type='button'
                              onClick={() => setSelectedDistrict(item)}
                              className='w-full rounded-lg px-2 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400'
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className='mb-2 text-xs font-semibold tracking-wide text-slate-500'>
                      미리보기 (시/도)
                    </div>
                    <ul className='flex flex-wrap gap-2'>
                      {previewDistricts.map(item => (
                        <li key={item.raw}>
                          <button
                            type='button'
                            onClick={() => {
                              setQuery(item.label);
                              setSelectedDistrict(item);
                            }}
                            className='rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400'
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedDistrict ? (
                <div className='mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700'>
                  선택한 장소:{' '}
                  <span className='font-semibold'>{selectedDistrict.label}</span>
                </div>
              ) : null}
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

            <div className='mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600'>
              현재 위치 날씨가 여기에 표시됩니다.
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
