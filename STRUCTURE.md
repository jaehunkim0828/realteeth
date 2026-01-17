# Project Structure

본 저장소는 루트에 Next.js(App Router, TypeScript, Tailwind) 프로젝트를 두고,
Feature Sliced Design(FSD) 기반으로 구성합니다.

- `app`: Next.js App Router (라우트/레이아웃/Route Handler)
  - `app/api`: Route Handlers (API)
- `widgets`: 화면 섹션 단위(조합 컴포넌트)
- `features`: 사용자 액션/유즈케이스 단위(검색, 즐겨찾기 등)
- `entities`: 도메인 단위(예: district, weather)
- `shared`: 전역 공용(유틸, UI primitives, API client 등)
- `style`: 전역/공용 스타일
- `public/data/korea_districts.json`: 대한민국 행정구역 데이터
- `public/uploads/{originals,shorts}`: 로컬 파일 저장
