# PNU Blace - 프로젝트 개요

## 프로젝트 목적
부산대학교 도서관 좌석 예약 시스템 (PNU Blace)
- 실시간 좌석 현황 확인
- 자동 좌석 예약
- 빈자리 알림 및 예측
- 좌석 예약/반납/연장 기능

## 기술 스택

### Frontend (apps/web)
- **Framework**: Next.js 15 (App Router)
- **React**: v19
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand, TanStack Query v5
- **Animation**: Framer Motion
- **Testing**: Vitest, Playwright (E2E), Storybook
- **Monitoring**: Sentry, Vercel Analytics

### Backend (apps/api)
- **Framework**: NestJS 11
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Cache**: Redis (ioredis)
- **Real-time**: Socket.io
- **Authentication**: JWT + Passport
- **Push Notifications**: Firebase Admin

### Mobile (apps/mobile)
- React Native / Expo
- EAS Build & Submit

### 공유 패키지 (packages/)
- `@pnu-blace/db`: 데이터베이스 엔티티 및 설정
- `@pnu-blace/types`: 공유 TypeScript 타입
- `@pnu-blace/eslint-config`: ESLint 설정
- `@pnu-blace/typescript-config`: TypeScript 설정

## Monorepo 구조
- **Tool**: Turborepo + Yarn Workspaces
- **Package Manager**: Yarn 3.6.4
- **Node.js**: >= 20

## 프로젝트 구조

```
pnu_blace/
├── apps/
│   ├── web/              # Next.js 웹 앱
│   │   ├── app/          # App Router 페이지
│   │   └── src/
│   │       ├── entities/   # 도메인 엔티티 (FSD)
│   │       ├── features/   # 기능별 모듈 (FSD)
│   │       ├── shared/     # 공통 컴포넌트 (FSD)
│   │       ├── widgets/    # 위젯 컴포넌트 (FSD)
│   │       └── providers/  # Context Providers
│   ├── api/              # NestJS API 서버
│   │   └── src/
│   │       ├── auth/       # 인증 모듈
│   │       ├── seats/      # 좌석 관리
│   │       ├── rooms/      # 열람실 관리
│   │       ├── users/      # 사용자 관리
│   │       ├── scheduler/  # 스케줄러
│   │       └── ...
│   ├── mobile/           # React Native 모바일 앱
│   └── docs/             # 문서 사이트
└── packages/
    ├── db/               # 데이터베이스 패키지
    ├── types/            # 공유 타입
    ├── eslint-config/    # ESLint 설정
    └── typescript-config/# TypeScript 설정
```

## 배포 환경
- **Web**: Vercel
- **API**: Railway
- **Mobile**: App Store / Play Store (EAS)

## 주요 페이지 (Web)
- `/` - 홈페이지 (서비스 소개)
- `/login` - 로그인
- `/dashboard` - 대시보드
- `/seats` - 좌석 찾기
- `/seats/[roomNo]` - 열람실 좌석 현황
