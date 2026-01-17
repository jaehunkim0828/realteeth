import { latLonToKmaGrid } from '@/shared/lib/kmaGrid';
import {
  formatYyyyMmDd,
  getVilageFcstBaseDateTime,
  toKst,
} from '@/shared/lib/kmaTime';

type KmaForecastItem = {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
};

type KmaResponse<T> = {
  response?: {
    header?: {
      resultCode?: string;
      resultMsg?: string;
    };
    body?: {
      items?: {
        item?: T[] | T;
      };
    };
  };
};

export type KmaDailyForecast = {
  today: { minC: number | null; maxC: number | null };
  hourly: Array<{ time: string; temperatureC: number }>;
};

export class KmaForecastError extends Error {
  resultCode: string;
  resultMsg: string;

  constructor(resultCode: string, resultMsg: string) {
    super(`KMA forecast error (${resultCode}): ${resultMsg}`);
    this.name = 'KmaForecastError';
    this.resultCode = resultCode;
    this.resultMsg = resultMsg;
  }
}

export class KmaForecastUpstreamError extends Error {
  status: number;
  statusText: string;
  contentType: string;
  bodySnippet: string;

  constructor(options: {
    status: number;
    statusText: string;
    contentType: string;
    bodySnippet: string;
  }) {
    super(
      `KMA forecast upstream error (${options.status} ${options.statusText}): ${options.bodySnippet}`
    );
    this.name = 'KmaForecastUpstreamError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.contentType = options.contentType;
    this.bodySnippet = options.bodySnippet;
  }
}

const KMA_FORECAST_ENDPOINT =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

function encodeServiceKey(value: string) {
  const trimmed = value.trim();
  return trimmed.includes('%') ? trimmed : encodeURIComponent(trimmed);
}

function asArray<T>(value: T[] | T | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function clipText(text: string, maxLength = 300) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

function parseFiniteNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getKmaForecastByLatLon(options: {
  lat: number;
  lon: number;
  serviceKey: string;
  now?: Date;
}): Promise<KmaDailyForecast> {
  const encodedKey = encodeServiceKey(options.serviceKey);
  if (!encodedKey) throw new Error('DATA_GO_KR_SERVICE_KEY is empty');

  const { nx, ny } = latLonToKmaGrid({ lat: options.lat, lon: options.lon });
  const { baseDate, baseTime } = getVilageFcstBaseDateTime(options.now);

  const params = new URLSearchParams({
    pageNo: '1',
    numOfRows: '2000',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const finalUrl = `${KMA_FORECAST_ENDPOINT}?serviceKey=${encodedKey}&${params.toString()}`;
  const response = await fetch(finalUrl, { next: { revalidate: 60 * 10 } });
  const contentType = response.headers.get('content-type') ?? '';
  const rawBody = await response.text();

  if (!response.ok) {
    throw new KmaForecastUpstreamError({
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodySnippet: clipText(rawBody),
    });
  }

  let data: KmaResponse<KmaForecastItem> | null = null;
  try {
    data = JSON.parse(rawBody) as KmaResponse<KmaForecastItem>;
  } catch {
    throw new KmaForecastUpstreamError({
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodySnippet: clipText(rawBody),
    });
  }

  const resultCode = data?.response?.header?.resultCode ?? 'UNKNOWN';
  const resultMsg = data?.response?.header?.resultMsg ?? 'UNKNOWN';
  if (resultCode !== '00') {
    throw new KmaForecastError(resultCode, resultMsg);
  }

  const items = asArray(data.response?.body?.items?.item);
  const kst = toKst(options.now ?? new Date());
  const todayDate = formatYyyyMmDd(kst);

  let minC: number | null = null;
  let maxC: number | null = null;
  const hourly: Array<{ time: string; temperatureC: number }> = [];

  for (const item of items) {
    if (item.fcstDate !== todayDate) continue;
    if (item.category === 'TMN') {
      minC = parseFiniteNumber(item.fcstValue);
      continue;
    }
    if (item.category === 'TMX') {
      maxC = parseFiniteNumber(item.fcstValue);
      continue;
    }
    if (item.category === 'TMP') {
      const temp = parseFiniteNumber(item.fcstValue);
      if (temp == null) continue;
      hourly.push({ time: item.fcstTime, temperatureC: temp });
    }
  }

  hourly.sort((a, b) => a.time.localeCompare(b.time));
  const uniqueHourly: Array<{ time: string; temperatureC: number }> = [];
  const seen = new Set<string>();
  for (const entry of hourly) {
    if (seen.has(entry.time)) continue;
    seen.add(entry.time);
    uniqueHourly.push(entry);
  }

  return { today: { minC, maxC }, hourly: uniqueHourly };
}

