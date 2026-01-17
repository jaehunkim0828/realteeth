'use client';

import { geocodeDistrict } from '@/entities/district/api/geocodeDistrict';
import type { DistrictEntry } from '@/entities/district/lib/koreaDistricts';
import type { FavoritePlace } from '@/entities/favorite/model/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'realteeth:favorites:v1';
const MAX_FAVORITES = 6;

function safeParse(json: string | null): FavoritePlace[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((item): item is FavoritePlace => {
      if (!item || typeof item !== 'object') return false;
      const typed = item as Partial<FavoritePlace>;
      return (
        typeof typed.id === 'string' &&
        typeof typed.districtRaw === 'string' &&
        typeof typed.label === 'string' &&
        typeof typed.alias === 'string' &&
        typeof typed.createdAt === 'number' &&
        !!typed.coords &&
        typeof typed.coords.lat === 'number' &&
        typeof typed.coords.lon === 'number'
      );
    });
  } catch {
    return [];
  }
}

function save(list: FavoritePlace[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useFavorites() {
  const [items, setItems] = useState<FavoritePlace[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(safeParse(localStorage.getItem(STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    save(items);
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    function onStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) return;
      if (event.key !== STORAGE_KEY) return;
      setItems(safeParse(event.newValue));
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [hydrated]);

  const count = items.length;
  const canAdd = count < MAX_FAVORITES;

  const byId = useMemo(() => {
    const map = new Map<string, FavoritePlace>();
    for (const item of items) map.set(item.id, item);
    return map;
  }, [items]);

  const isFavorite = useCallback(
    (entry: DistrictEntry | null) => {
      if (!entry) return false;
      return items.some(item => item.districtRaw === entry.raw);
    },
    [items]
  );

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateAlias = useCallback((id: string, alias: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, alias } : item))
    );
  }, []);

  const addFromDistrict = useCallback(
    async (entry: DistrictEntry) => {
      if (items.some(item => item.districtRaw === entry.raw)) {
        throw new Error('이미 즐겨찾기에 추가된 장소입니다.');
      }
      if (items.length >= MAX_FAVORITES) {
        throw new Error(
          `즐겨찾기는 최대 ${MAX_FAVORITES}개까지 추가할 수 있습니다.`
        );
      }

      const coords = await geocodeDistrict(entry);
      const id = crypto.randomUUID();
      const createdAt = Date.now();
      const favorite: FavoritePlace = {
        id,
        districtRaw: entry.raw,
        label: entry.label,
        alias: entry.label,
        coords: { lat: coords.lat, lon: coords.lon },
        createdAt,
      };

      setItems(prev => [favorite, ...prev]);
      return favorite;
    },
    [items]
  );

  return {
    hydrated,
    items,
    byId,
    count,
    canAdd,
    isFavorite,
    addFromDistrict,
    remove,
    updateAlias,
  };
}
