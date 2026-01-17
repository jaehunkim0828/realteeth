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

const KMA_NOWCAST_ENDPOINT =
  'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';

function jsonError(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

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

export async function GET(request: Request) {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!serviceKey) {
    return jsonError('DATA_GO_KR_SERVICE_KEY가 설정되어 있지 않습니다.', 500);
  }

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return jsonError(
      'lat, lon 쿼리가 필요합니다. (예: ?lat=37.5665&lon=126.9780)'
    );
  }

  const { nx, ny } = latLonToKmaGrid({ lat, lon });
  const { baseDate, baseTime } = getUltraSrtNcstBaseDateTime();

  const encodedKey = encodeServiceKey(serviceKey);
  if (!encodedKey) {
    return jsonError('DATA_GO_KR_SERVICE_KEY 값이 비어있습니다.', 500);
  }

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
  console.log(finalUrl);

  if (!response.ok) {
    return Response.json(
      {
        ok: false,
        error: `기상청 API 요청이 실패했습니다. (${response.status} ${response.statusText})`,
        hint: '공공데이터포털에서 발급받은 "Encoding" 서비스키를 사용했는지 확인해주세요.',
        upstream: { contentType, body: clipText(rawBody) },
      },
      { status: 502 }
    );
  }

  let data: KmaResponse<KmaNowcastItem> | null = null;
  try {
    data = JSON.parse(rawBody) as KmaResponse<KmaNowcastItem>;
  } catch {
    return Response.json(
      {
        ok: false,
        error: '기상청 API가 JSON이 아닌 응답을 반환했습니다.',
        upstream: { contentType, body: clipText(rawBody) },
      },
      { status: 502 }
    );
  }

  if (!data?.response?.header) {
    return jsonError('기상청 API 응답을 처리할 수 없습니다.', 502);
  }

  const resultCode = data.response.header.resultCode ?? 'UNKNOWN';
  const resultMsg = data.response.header.resultMsg ?? 'UNKNOWN';
  if (resultCode !== '00') {
    return jsonError(`기상청 API 오류 (${resultCode}): ${resultMsg}`, 502);
  }

  const items = asArray(data.response.body?.items?.item);
  const values: Record<string, string> = {};
  for (const item of items) {
    values[item.category] = item.obsrValue;
  }

  const now = {
    temperatureC: parseNumber(values.T1H),
    humidity: parseNumber(values.REH),
    windSpeed: parseNumber(values.WSD),
    precipitation1h: parseNumber(values.RN1),
    precipitationType: parseNumber(values.PTY),
  };

  return Response.json({
    ok: true,
    location: { lat, lon, nx, ny },
    base: { date: baseDate, time: baseTime },
    now,
  });
}
