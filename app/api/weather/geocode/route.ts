import { geocodeKorea } from '@/shared/api/geocode/korea';

type ErrorResponse = {
  ok: false;
  error: string;
};

function jsonError(message: string, status = 400): Response {
  return Response.json({ ok: false, error: message } satisfies ErrorResponse, {
    status,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim();
  if (!query) return jsonError('q 파라미터가 필요합니다. (예: ?q=종로구)');

  try {
    const result = await geocodeKorea(query);
    if (result) return Response.json({ ok: true, ...result });

    return jsonError('해당 장소의 좌표를 찾을 수 없습니다.', 404);
  } catch (error) {
    console.error(error);
    return jsonError('geocode 처리 중 오류가 발생했습니다.', 500);
  }
}
