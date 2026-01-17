'use client';

import {
  buildDistrictIndex,
  searchDistricts,
  type DistrictEntry,
} from '@/entities/district/lib/koreaDistricts';
import { SearchIcon } from '@/shared/ui/icon';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

type Props = {
  selected: DistrictEntry | null;
  onSelect: (entry: DistrictEntry) => void;
};

export function DistrictSearch({ selected, onSelect }: Props) {
  const [districtIndex, setDistrictIndex] = useState<DistrictEntry[] | null>(
    null
  );
  const [districtError, setDistrictError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

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
            <p className='text-slate-600'>행정구역 데이터를 불러오는 중…</p>
          ) : query.trim() ? (
            <div>
              <div className='mb-2 text-xs font-semibold tracking-wide text-slate-500'>
                검색 미리보기
              </div>
              {suggestions.length === 0 ? (
                <p className='text-slate-600'>일치하는 장소가 없습니다.</p>
              ) : (
                <ul className='space-y-1'>
                  {suggestions.map(item => (
                    <li key={item.raw}>
                      <button
                        type='button'
                        onClick={() => {
                          setQuery(item.label);
                          onSelect(item);
                        }}
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
                        onSelect(item);
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

        {selected ? (
          <div className='mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700'>
            선택한 장소: <span className='font-semibold'>{selected.label}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

