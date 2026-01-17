# Project Structure

본 저장소는 루트에 Next.js(App Router, TypeScript, Tailwind) 프로젝트를 둡니다.

- `Convention.md`: 프로젝트 컨벤션
- `app`: Next.js App Router
  - `app/api`: Route Handlers (API)
- `style`: 전역/공용 스타일
- `public/uploads/{originals,shorts}`: 로컬 파일 저장
- `components`: 컴포넌트
  - `components/common`: 공통 컴포넌트
- `state`: 전역 상태
- `lib`: 공용 유틸
  - `lib/U`: 유틸리티 함수
- `@types`: Declaration files (`.d.ts`)
- `hooks`: 커스텀 훅
