import {
  getKmaNowcastByLatLon,
  KmaResponseError,
  KmaUpstreamError,
} from '@/shared/api/kma/nowcast';
import {
  getKmaForecastByLatLon,
  KmaForecastError,
  KmaForecastUpstreamError,
} from '@/shared/api/kma/forecast';

function jsonError(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
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
  try {
    const [nowcast, forecast] = await Promise.all([
      getKmaNowcastByLatLon({ lat, lon, serviceKey }),
      getKmaForecastByLatLon({ lat, lon, serviceKey }),
    ]);

    return Response.json({
      ok: true,
      ...nowcast,
      today: forecast.today,
      hourly: forecast.hourly,
    });
  } catch (error) {
    if (error instanceof KmaResponseError) {
      return jsonError(
        `기상청 API 오류 (${error.resultCode}): ${error.resultMsg}`,
        502
      );
    }

    if (error instanceof KmaUpstreamError) {
      return Response.json(
        {
          ok: false,
          error: `기상청 API 요청이 실패했습니다. (${error.status} ${error.statusText})`,
          hint: '공공데이터포털에서 발급받은 "Encoding" 서비스키를 사용했는지 확인해주세요.',
          upstream: {
            contentType: error.contentType,
            body: error.bodySnippet,
          },
        },
        { status: 502 }
      );
    }

    if (error instanceof KmaForecastError) {
      return jsonError(
        `기상청 API 오류 (${error.resultCode}): ${error.resultMsg}`,
        502
      );
    }

    if (error instanceof KmaForecastUpstreamError) {
      return Response.json(
        {
          ok: false,
          error: `기상청 API 요청이 실패했습니다. (${error.status} ${error.statusText})`,
          hint: '공공데이터포털에서 발급받은 "Encoding" 서비스키를 사용했는지 확인해주세요.',
          upstream: {
            contentType: error.contentType,
            body: error.bodySnippet,
          },
        },
        { status: 502 }
      );
    }

    console.error(error);
    return jsonError('서버 오류가 발생했습니다.', 500);
  }
}
