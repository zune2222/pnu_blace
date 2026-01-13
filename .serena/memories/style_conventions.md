# PNU Blace - 코드 스타일 및 컨벤션

## TypeScript 설정

### 공통 (packages/typescript-config/base.json)
- `strict: true` - 엄격 모드 활성화
- `noUncheckedIndexedAccess: true` - 인덱스 접근 시 undefined 체크 필수
- `target: ES2022`, `module: NodeNext`
- `esModuleInterop: true`

### Web (Next.js)
- `@pnu-blace/typescript-config/nextjs.json` 상속
- Path alias: `@/*` -> `src/*`

## ESLint 설정

### 공통 규칙
- ESLint 9 Flat Config 사용
- `typescript-eslint` 추천 규칙
- `eslint-config-prettier`로 Prettier와 충돌 방지
- `eslint-plugin-turbo` - Turborepo 환경변수 체크
- `eslint-plugin-only-warn` - 경고로 변환

### Web 추가 규칙
- `@next/eslint-plugin-next` - Next.js 규칙
- `eslint-plugin-react`, `eslint-plugin-react-hooks`
- `eslint-plugin-storybook` - Storybook 규칙
- `react/prop-types: off` - TypeScript 사용으로 불필요

### API 추가 규칙
- `eslint-plugin-prettier` - Prettier 통합

## Prettier 설정

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

## 아키텍처 패턴

### Web (Feature-Sliced Design)
```
src/
├── entities/    # 비즈니스 엔티티 (독립적)
├── features/    # 기능 모듈 (사용자 시나리오)
├── shared/      # 공통 유틸, 컴포넌트, 훅
├── widgets/     # 독립적인 UI 블록
└── providers/   # Context Providers
```

### API (NestJS Module Pattern)
```
src/
├── auth/        # 인증 모듈
├── users/       # 사용자 모듈
├── seats/       # 좌석 모듈
└── ...          # 도메인별 모듈
```

각 모듈 구조:
- `*.module.ts` - 모듈 정의
- `*.controller.ts` - HTTP 컨트롤러
- `*.service.ts` - 비즈니스 로직
- `*.dto.ts` - Data Transfer Objects
- `*.spec.ts` - 테스트

## 네이밍 컨벤션

### 파일명
- **컴포넌트**: PascalCase (`Button.tsx`, `SeatCard.tsx`)
- **훅**: camelCase with `use` prefix (`useSeat.ts`, `useAuth.ts`)
- **유틸**: camelCase (`formatDate.ts`, `cn.ts`)
- **타입**: PascalCase (`Seat.ts`, `User.ts`)
- **NestJS**: kebab-case (`auth.service.ts`, `seats.controller.ts`)

### 코드
- **변수/함수**: camelCase
- **상수**: UPPER_SNAKE_CASE (선택적)
- **타입/인터페이스**: PascalCase
- **컴포넌트**: PascalCase
- **훅**: camelCase with `use` prefix

## 임포트 순서

1. 외부 라이브러리 (`react`, `next`, etc.)
2. 내부 패키지 (`@pnu-blace/*`)
3. 로컬 모듈 (`@/*`, `./`)
4. 타입 임포트

## 컴포넌트 작성

### React 컴포넌트
```tsx
interface Props {
  // props 정의
}

export function ComponentName({ prop1, prop2 }: Props) {
  // 훅 호출
  // 핸들러 정의
  // JSX 반환
}
```

### 스타일링
- Tailwind CSS 클래스 사용
- `clsx` + `tailwind-merge` 조합 (`cn` 유틸)
- 조건부 스타일링에 `clsx` 사용

## Git 컨벤션

### 커밋 메시지
- `feat:` - 새 기능
- `fix:` - 버그 수정
- `refactor:` - 리팩토링
- `perf:` - 성능 개선
- `docs:` - 문서
- `chore:` - 기타 작업

### 브랜치
- `main` - 메인 브랜치
- `feature/*` - 기능 개발
- `fix/*` - 버그 수정
