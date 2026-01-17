import { latLonToKmaGrid } from '@/shared/lib/kmaGrid';
import { getUltraSrtNcstBaseDateTime } from '@/shared/lib/kmaTime';

type KmaNowcastItem = {
  baseDate: string;
  baseTime: string;
  category: string;
  nx: number;
  ny: number;
  obsrValue: string;
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

export type KmaNowcast = {
  location: { lat: number; lon: number; nx: number; ny: number };
  base: { date: string; time: string };
  now: {
    temperatureC: number | null;
    humidity: number | null;
    windSpeed: number | null;
    precipitation1h: number | null;
    precipitationType: number | null;
  };
};

export class KmaUpstreamError extends Error {
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
      `KMA upstream error (${options.status} ${options.statusText}): ${options.bodySnippet}`
    );
    this.name = 'KmaUpstreamError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.contentType = options.contentType;
    this.bodySnippet = options.bodySnippet;
  }
}

export class KmaResponseError extends Error {
  resultCode: string;
  resultMsg: string;

  constructor(resultCode: string, resultMsg: string) {
    super(`KMA response error (${resultCode}): ${resultMsg}`);
    this.name = 'KmaResponseError';
    this.resultCode = resultCode;
    this.resultMsg = resultMsg;
  }
}

const KMA_NOWCAST_ENDPOINT =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

function encodeServiceKey(value: string) {
  const trimmed = value.trim();
  return trimmed.includes('%') ? trimmed : encodeURIComponent(trimmed);
}

function parseNumber(value: string | undefined) {
  if (!value) return null;
  if (value === '강수없음') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asArray<T>(value: T[] | T | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function clipText(text: string, maxLength = 300) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

export async function getKmaNowcastByLatLon(options: {
  lat: number;
  lon: number;
  serviceKey: string;
}): Promise<KmaNowcast> {
  const { lat, lon } = options;
  const encodedKey = encodeServiceKey(options.serviceKey);
  if (!encodedKey) {
    throw new Error('DATA_GO_KR_SERVICE_KEY is empty');
  }

  const { nx, ny } = latLonToKmaGrid({ lat, lon });
  const { baseDate, baseTime } = getUltraSrtNcstBaseDateTime();

  const params = new URLSearchParams({
    pageNo: '1',
    numOfRows: '1000',
    dataType: 'JSON',
    base_date: baseDate,
    base_time: baseTime,
    nx: String(nx),
    ny: String(ny),
  });

  const finalUrl = `${KMA_NOWCAST_ENDPOINT}?serviceKey=${encodedKey}&${params.toString()}`;
  const response = await fetch(finalUrl, { next: { revalidate: 60 } });

  const contentType = response.headers.get('content-type') ?? '';
  const rawBody = await response.text();

  if (!response.ok) {
    throw new KmaUpstreamError({
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodySnippet: clipText(rawBody),
    });
  }

  let data: KmaResponse<KmaNowcastItem> | null = null;
  try {
    data = JSON.parse(rawBody) as KmaResponse<KmaNowcastItem>;
  } catch {
    throw new KmaUpstreamError({
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodySnippet: clipText(rawBody),
    });
  }

  const resultCode = data?.response?.header?.resultCode ?? 'UNKNOWN';
  const resultMsg = data?.response?.header?.resultMsg ?? 'UNKNOWN';
  if (resultCode !== '00') {
    throw new KmaResponseError(resultCode, resultMsg);
  }

  const items = asArray(data.response?.body?.items?.item);
  const values: Record<string, string> = {};
  for (const item of items) {
    values[item.category] = item.obsrValue;
  }

  return {
    location: { lat, lon, nx, ny },
    base: { date: baseDate, time: baseTime },
    now: {
      temperatureC: parseNumber(values.T1H),
      humidity: parseNumber(values.REH),
      windSpeed: parseNumber(values.WSD),
      precipitation1h: parseNumber(values.RN1),
      precipitationType: parseNumber(values.PTY),
    },
  };
}

