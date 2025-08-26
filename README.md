# PNU Blace

부산대학교 도서관 좌석 예약 시스템

## 🎯 개요

PNU Blace는 부산대학교 도서관의 좌석 예약을 더욱 편리하게 만들어주는 웹 애플리케이션입니다. 실시간 좌석 현황 확인, 자동 예약, 빈자리 알림 등의 기능을 제공합니다.

## ✨ 주요 기능

- **실시간 좌석 현황**: 도서관 각 열람실의 실시간 좌석 상태 확인
- **자동 좌석 예약**: 원하는 좌석이 비워지면 자동으로 예약
- **좌석 예약/반납**: 간편한 좌석 예약 및 반납 기능
- **좌석 연장**: 현재 사용 중인 좌석 이용 시간 연장
- **빈자리 예측**: AI 기반 좌석 반납 시간 예측
- **즐겨찾기**: 자주 이용하는 열람실 즐겨찾기 기능
- **알림 서비스**: 좌석 상태 변경 알림

## 🏗️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Language**: TypeScript
- **Fonts**: Pretendard, Geist

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (추정)
- **Authentication**: JWT
- **Scheduler**: Bull Queue (추정)

### Development Tools
- **Monorepo**: Turborepo
- **Package Manager**: Yarn
- **Linting**: ESLint
- **Formatting**: Prettier

## 🚀 시작하기

### 필수 요구사항
- Node.js >= 20
- Yarn 1.22.22

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd pnu_blace

# 의존성 설치
yarn install

# 개발 서버 실행 (모든 앱)
yarn dev

# 특정 앱만 실행
yarn dev --filter=web    # 웹 앱만
yarn dev --filter=api    # API 서버만
```

### 빌드

```bash
# 전체 빌드
yarn build

# 특정 앱 빌드
yarn build:web    # 웹 앱 빌드
yarn build:api    # API 서버 빌드
```

## 📁 프로젝트 구조

```
pnu_blace/
├── apps/
│   ├── web/                # Next.js 웹 애플리케이션
│   │   ├── app/           # App Router 페이지
│   │   └── src/           # 소스 코드
│   │       ├── entities/  # 도메인 엔티티
│   │       ├── features/  # 기능별 모듈
│   │       ├── shared/    # 공통 컴포넌트
│   │       └── widgets/   # 위젯 컴포넌트
│   ├── api/               # NestJS API 서버
│   │   └── src/
│   │       ├── auth/      # 인증 모듈
│   │       ├── seats/     # 좌석 관리 모듈
│   │       ├── scheduler/ # 스케줄러 모듈
│   │       └── users/     # 사용자 모듈
│   └── docs/              # 문서 사이트
└── packages/              # 공유 패키지
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행
yarn dev

# 코드 린팅
yarn lint

# 타입 체크
yarn type-check

# 코드 포매팅
yarn format

# 프로덕션 시작
yarn start
```

## 📱 주요 페이지

- `/` - 홈페이지 (서비스 소개)
- `/login` - 로그인
- `/dashboard` - 대시보드 (현재 좌석, 즐겨찾기 등)
- `/seats` - 좌석 찾기 (전체 열람실 목록)
- `/seats/[roomNo]` - 특정 열람실 좌석 현황

## 🌐 배포

### Vercel (Web)
웹 애플리케이션은 Vercel을 통해 자동 배포됩니다.

### Railway (API)
API 서버는 Railway에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해 주세요.