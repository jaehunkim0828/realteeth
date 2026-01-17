'use client';

import type { FavoritePlace } from '@/entities/favorite/model/types';
import { WeatherDetail } from '@/widgets/weather-detail/ui/WeatherDetail';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'realteeth:favorites:v1';

export default function FavoriteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [items, setItems] = useState<FavoritePlace[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      setItems(Array.isArray(parsed) ? (parsed as FavoritePlace[]) : []);
    } catch {
      setItems([]);
    }
  }, []);

  const place = useMemo(
    () => items.find(item => item.id === params.id) ?? null,
    [items, params.id]
  );

  return (
    <main className='py-10'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <Link href='/' className='text-sm font-medium text-slate-700 hover:underline'>
            ← 대시보드로
          </Link>
        </div>

        {place ? (
          <WeatherDetail place={place} />
        ) : (
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <h1 className='text-xl font-semibold text-slate-900'>
              장소를 찾을 수 없습니다
            </h1>
            <p className='mt-2 text-sm text-slate-600'>
              즐겨찾기에서 삭제되었거나, 브라우저 저장소가 초기화되었을 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
