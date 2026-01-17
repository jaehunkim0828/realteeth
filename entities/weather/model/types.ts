export type WeatherNowcast = {
  temperatureC: number | null;
  humidity: number | null;
  windSpeed: number | null;
  precipitation1h: number | null;
  precipitationType: number | null;
};

export type WeatherOkResponse = {
  ok: true;
  location: {
    lat: number;
    lon: number;
    nx: number;
    ny: number;
  };
  base: { date: string; time: string };
  now: WeatherNowcast;
  today: { minC: number | null; maxC: number | null };
  hourly: Array<{ time: string; temperatureC: number }>;
};

export type WeatherErrorResponse = {
  ok: false;
  error: string;
};

export type WeatherApiResponse = WeatherOkResponse | WeatherErrorResponse;

export function formatPrecipitationType(value: number | null) {
  switch (value) {
    case 0:
      return '없음';
    case 1:
      return '비';
    case 2:
      return '비/눈';
    case 3:
      return '눈';
    case 4:
      return '소나기';
    default:
      return '-';
  }
}

export function hasAnyNowcast(now: WeatherNowcast) {
  return (
    now.temperatureC != null ||
    now.humidity != null ||
    now.windSpeed != null ||
    now.precipitation1h != null ||
    now.precipitationType != null
  );
}
