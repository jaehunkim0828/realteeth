'use client';

import type { FavoritePlace } from '@/entities/favorite/model/types';
import { getWeatherByCoords } from '@/entities/weather/api/getWeatherByCoords';
import type { WeatherOkResponse } from '@/entities/weather/model/types';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  items: FavoritePlace[];
  max: number;
  onRemove: (id: string) => void;
  onUpdateAlias: (id: string, alias: string) => void;
};

type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ok'; data: WeatherOkResponse }
  | { status: 'error'; error: string };

export function FavoriteList({ items, max, onRemove, onUpdateAlias }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasDraft, setAliasDraft] = useState('');
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherState>>({});

  const visible = useMemo(() => items.slice(0, max), [items, max]);

  useEffect(() => {
    let cancelled = false;

    async function load(item: FavoritePlace) {
      setWeatherMap(prev => ({ ...prev, [item.id]: { status: 'loading' } }));
      try {
        const data = await getWeatherByCoords(item.coords);
        if (cancelled) return;
        setWeatherMap(prev => ({ ...prev, [item.id]: { status: 'ok', data } }));
      } catch (error) {
        if (cancelled) return;
        setWeatherMap(prev => ({
          ...prev,
          [item.id]: {
            status: 'error',
            error:
              error instanceof Error
                ? error.message
                : '날씨 정보를 불러오지 못했습니다.',
          },
        }));
      }
    }

    for (const item of visible) {
      const state = weatherMap[item.id];
      if (!state || state.status === 'idle') {
        void load(item);
      }
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible.map(v => v.id).join('|')]);

  return (
    <div className='space-y-3'>
      {visible.map(item => {
        const state = weatherMap[item.id] ?? { status: 'idle' as const };
        const isEditing = editingId === item.id;
        const weatherText =
          state.status === 'ok'
            ? `${state.data.now.temperatureC ?? '-'}° · 최저 ${
                state.data.today.minC ?? '-'
              }° 최고 ${state.data.today.maxC ?? '-'}°`
            : state.status === 'loading'
              ? '날씨 불러오는 중…'
              : state.status === 'error'
                ? state.error
                : '—';

        return (
          <div
            key={item.id}
            className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
          >
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <Link
                    href={`/favorites/${item.id}`}
                    className='truncate text-sm font-semibold text-slate-900 hover:underline'
                  >
                    {item.alias}
                  </Link>
                  <span className='shrink-0 text-xs text-slate-500'>
                    {item.label}
                  </span>
                </div>
                <div className='mt-1 text-xs text-slate-600'>{weatherText}</div>
              </div>

              <div className='flex shrink-0 items-center gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setEditingId(item.id);
                    setAliasDraft(item.alias);
                  }}
                  className='rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900'
                >
                  이름
                </button>
                <button
                  type='button'
                  onClick={() => onRemove(item.id)}
                  className='rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-rose-600'
                >
                  삭제
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className='mt-3 flex items-center gap-2'>
                <input
                  value={aliasDraft}
                  onChange={e => setAliasDraft(e.target.value)}
                  className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400'
                  placeholder='별칭을 입력하세요'
                  autoFocus
                />
                <button
                  type='button'
                  onClick={() => {
                    onUpdateAlias(item.id, aliasDraft.trim() || item.label);
                    setEditingId(null);
                  }}
                  className='rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
                >
                  저장
                </button>
                <button
                  type='button'
                  onClick={() => setEditingId(null)}
                  className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700'
                >
                  취소
                </button>
              </div>
            ) : null}
          </div>
        );
      })}

      {visible.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600'>
          아직 즐겨찾기가 없습니다.
        </div>
      ) : null}
    </div>
  );
}

