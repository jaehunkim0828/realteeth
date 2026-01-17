# realteeth (weather)

채용 과제 요구사항을 만족하는 **대한민국 날씨 앱**을 구현했습니다.

- 첫 진입 시 현재 위치 날씨 조회
- 행정구역(시/군/구/동) 검색 → 선택 → 날씨 조회
- 즐겨찾기(최대 6개) 추가/삭제 + 별칭 수정 + 상세 페이지

---

## 실행

### 1) 의존성 설치

```bash
npm install
```

### 2) 환경변수 설정

`.env.example`를 참고해서 `.env`를 작성합니다.

필수:

- `DATA_GO_KR_SERVICE_KEY`: 공공데이터포털(기상청) 서비스키 (**Encoding 키 권장**)

미사용(이번 제출에서는 설정하지 않음):

- `KAKAO_REST_API_KEY`
- `NOMINATIM_USER_AGENT`

### 3) 개발 서버 실행

```bash
npm run dev
```

---

## 과제 요구사항 적용

### 1. Open API로 날씨(현재/최저/최고/시간대별) 표시

- 공공데이터포털(기상청) API를 사용했습니다.
  - 현재: 초단기실황(`getUltraSrtNcst`)
  - 당일 최저/최고 + 시간대별 기온: 동네예보(`getVilageFcst`)에서 `TMN/TMX/TMP`를 파싱
- 화면 표시:
  - 대시보드 `현재 위치`, `선택한 장소` 카드에서 현재/최저/최고/시간대별 기온을 표시합니다.
  - 즐겨찾기 상세 페이지(`/favorites/[id]`)에서 요구사항의 모든 정보를 표시합니다.

### 2. 앱 첫 진입 시 현재 위치 감지

- 브라우저 `navigator.geolocation`을 이용해 위치 권한을 요청하고, `lat/lon` 기반으로 날씨를 조회합니다.

### 3. 대한민국 한정 장소 검색 + 선택 + “정보 없음” 처리

- 행정구역 검색은 제공받은 `public/data/korea_districts.json`을 인덱싱해서 **시/군/구/동 단위 상관없이** 검색되도록 구현했습니다.
- 검색어 입력 시 매칭 리스트를 노출하고, 리스트에서 선택하면 해당 장소의 날씨를 조회합니다.
- 날씨 조회가 실패하거나 데이터가 비어있는 경우 UI에 `해당 장소의 정보가 제공되지 않습니다.` 를 명시합니다.
- 좌표 변환(geocode):
  - 이번 구현: Nominatim(OSM) 사용 (별도 키 없이 동작)
  - (옵션) Kakao Local 키를 넣으면 우선 사용하도록 확장 가능

### 4. 즐겨찾기(최대 6개) + 카드 UI + 별칭 수정 + 상세 페이지

- 즐겨찾기 추가/삭제:
  - 선택한 장소 카드에서 `즐겨찾기 추가`로 등록
  - 즐겨찾기 섹션에서 삭제 가능
  - 최대 6개 제한
- 별칭 수정:
  - 카드에서 `이름` 버튼으로 별칭을 수정
- 카드 UI 정보:
  - 카드에 현재 기온 + 오늘 최저/최고를 표시
- 상세 페이지:
  - 카드 클릭 → `/favorites/[id]`
  - 상세 페이지에서 현재/최저/최고/시간대별 기온 표시
- 저장 방식:
  - 브라우저 `localStorage`에 저장해 새로고침해도 유지됩니다.

---

## 캐시 전략 (TanStack Query)

날씨 데이터는 시간 단위로 갱신되는 특성을 고려해서 `@tanstack/react-query`로 캐시를 적용했습니다.

- 캐시 키
  - 현재 위치/선택 장소/즐겨찾기 모두 `lat/lon` 기반으로 queryKey를 구성합니다.
- 갱신 기준
  - **다음 정각(KST)까지는 캐시를 사용**하고, 정각이 지나면 refetch 되도록 구성합니다.
- 구현
  - `staleTime`: `msUntilNextHourKst()` (현재 시각 기준 다음 정각까지)
  - `refetchInterval`: 다음 정각까지 남은 시간
  - 관련 코드: `shared/lib/queryTime.ts`, `entities/weather/api/queryOptions.ts`

---

## 라우팅 / API

### 페이지

- `/`: 대시보드
- `/favorites/[id]`: 즐겨찾기 상세

### Route Handlers

- `GET /api/weather?lat=...&lon=...`
  - 현재(nowcast) + 오늘 최저/최고 + 시간대별 기온을 합쳐서 반환
- `GET /api/weather/geocode?q=...`
  - 검색 문자열을 위경도로 변환해 반환

---

## 폴더 구조 (FSD)

기능과 변경 범위를 명확히 하기 위해 Feature-Sliced Design(FSD) 개념을 적용했습니다.

- `app/`: Next.js 라우팅, Route Handler
- `shared/`: 외부 API 클라이언트/유틸리티 (기상청, geocode 등)
- `entities/`: 도메인 타입/로우레벨 API
- `features/`: 유스케이스 단위 로직 (검색, 즐겨찾기, 위치 기반 조회)
- `widgets/`: 화면을 구성하는 상위 조합 컴포넌트

---

## 기술 선택 이유

- Next.js (App Router)
  - `app/` 기반 라우팅과 Route Handler를 통해 API 계층과 UI를 한 프로젝트에서 관리
  - 과제 범위에서 빠르게 페이지/서버 API를 구성하기에 적합
- TypeScript
  - 날씨/좌표/즐겨찾기 등 도메인 모델과 API 응답을 타입으로 명확히 해 안정성 확보
- Tailwind CSS
  - 빠른 UI 구현 + 반응형 대응
  - 과제 요구사항에 맞게 유틸리티 기반으로 스타일 일관성 유지
- 공공데이터포털(기상청) API
  - 과제 조건에 부합하는 “Open API”이면서 국내 데이터 정합성이 높음
  - 현재/예보 데이터를 분리해 필요한 정보만 조합 가능
- FSD(Feature Sliced Design)
  - “검색”, “현재 위치”, “즐겨찾기”처럼 기능 단위로 코드가 분리되어 확장/수정 시 영향 범위를 줄임
- TanStack Query
  - 날씨 조회(현재 위치/선택 장소/즐겨찾기/상세 페이지)를 캐시하고, “다음 정각” 기준으로 갱신 타이밍을 통제하기 위해 사용
