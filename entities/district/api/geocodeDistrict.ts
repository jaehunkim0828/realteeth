import type { DistrictEntry } from '@/entities/district/lib/koreaDistricts';

type GeocodeApiResponse =
  | { ok: true; query: string; provider: string; lat: number; lon: number }
  | { ok: false; error: string };

export function districtToGeocodeQuery(entry: DistrictEntry) {
  return entry.parts.join(' ');
}

export async function geocodeDistrict(entry: DistrictEntry) {
  const q = districtToGeocodeQuery(entry);
  const response = await fetch(`/api/weather/geocode?q=${encodeURIComponent(q)}`);
  const json = (await response.json().catch(() => null)) as unknown;

  if (!json || typeof json !== 'object' || !('ok' in json)) {
    throw new Error('장소 좌표를 찾을 수 없습니다.');
  }

  const typed = json as GeocodeApiResponse;
  if (!typed.ok) {
    throw new Error(typed.error);
  }

  return { lat: typed.lat, lon: typed.lon, provider: typed.provider };
}

