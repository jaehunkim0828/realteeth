import {
  hasAnyNowcast,
  type WeatherOkResponse,
} from '@/entities/weather/model/types';

export async function getWeatherByCoords(options: {
  lat: number;
  lon: number;
}): Promise<WeatherOkResponse> {
  const { lat, lon } = options;
  const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  const json = (await response.json().catch(() => null)) as unknown;

  if (!json || typeof json !== 'object' || !('ok' in json)) {
    throw new Error('날씨 API 응답을 처리할 수 없습니다.');
  }

  if (!('ok' in json) || (json as { ok?: unknown }).ok !== true) {
    throw new Error('날씨 정보를 불러오지 못했습니다.');
  }

  const ok = json as WeatherOkResponse;
  if (!hasAnyNowcast(ok.now)) {
    throw new Error('해당 장소의 정보가 제공되지 않습니다.');
  }

  return ok;
}
