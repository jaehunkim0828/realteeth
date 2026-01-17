type GeocodeResult = {
  query: string;
  provider: 'kakao-address' | 'kakao-keyword' | 'nominatim';
  lat: number;
  lon: number;
};

function parseCoordinate(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function tryKakao(query: string): Promise<GeocodeResult | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY?.trim();
  if (!apiKey) return null;

  const addressUrl = new URL(
    'https://dapi.kakao.com/v2/local/search/address.json'
  );
  addressUrl.searchParams.set('query', query);
  addressUrl.searchParams.set('size', '1');

  const addressResponse = await fetch(addressUrl, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
    next: { revalidate: 60 * 60 },
  });

  if (addressResponse.ok) {
    const json = (await addressResponse.json().catch(() => null)) as
      | { documents?: Array<{ x?: unknown; y?: unknown }> }
      | null;
    const doc = json?.documents?.[0];
    const lon = parseCoordinate(doc?.x);
    const lat = parseCoordinate(doc?.y);
    if (lat != null && lon != null) {
      return { query, provider: 'kakao-address', lat, lon };
    }
  }

  const keywordUrl = new URL(
    'https://dapi.kakao.com/v2/local/search/keyword.json'
  );
  keywordUrl.searchParams.set('query', query);
  keywordUrl.searchParams.set('size', '1');

  const keywordResponse = await fetch(keywordUrl, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
    next: { revalidate: 60 * 60 },
  });

  if (!keywordResponse.ok) return null;

  const json = (await keywordResponse.json().catch(() => null)) as
    | { documents?: Array<{ x?: unknown; y?: unknown }> }
    | null;
  const doc = json?.documents?.[0];
  const lon = parseCoordinate(doc?.x);
  const lat = parseCoordinate(doc?.y);
  if (lat == null || lon == null) return null;

  return { query, provider: 'kakao-keyword', lat, lon };
}

async function tryNominatim(query: string): Promise<GeocodeResult | null> {
  const userAgent =
    process.env.NOMINATIM_USER_AGENT?.trim() || 'realteeth-weather-app';
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'kr');
  url.searchParams.set('q', query);

  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      'Accept-Language': 'ko',
    },
    next: { revalidate: 60 * 60 },
  });
  if (!response.ok) return null;

  const json = (await response.json().catch(() => null)) as
    | Array<{ lat?: unknown; lon?: unknown }>
    | null;
  const doc = json?.[0];
  const lat = parseCoordinate(doc?.lat);
  const lon = parseCoordinate(doc?.lon);
  if (lat == null || lon == null) return null;

  return { query, provider: 'nominatim', lat, lon };
}

export async function geocodeKorea(query: string): Promise<GeocodeResult | null> {
  const kakao = await tryKakao(query);
  if (kakao) return kakao;
  return tryNominatim(query);
}

