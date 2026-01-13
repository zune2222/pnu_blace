# PNU Blace - 개발 명령어

## 개발 환경 실행

```bash
# 전체 개발 서버 실행 (Docker + Turbo)
yarn dev

# Docker 없이 실행
yarn dev:no-docker

# 특정 앱만 실행
yarn dev --filter=web        # 웹 앱만
yarn dev --filter=api        # API 서버만

# Docker 관리
yarn docker:up               # Docker 컨테이너 시작
yarn docker:down             # Docker 컨테이너 중지
yarn docker:logs             # Docker 로그 확인
```

## 빌드

```bash
# 전체 빌드 (docs 제외)
yarn build

# 특정 앱 빌드
yarn build:web               # 웹 앱 빌드
yarn build:api               # API 서버 빌드
```

## 코드 품질

```bash
# 린팅 (전체)
yarn lint

# 타입 체크
yarn check-types
yarn type-check

# 코드 포맷팅
yarn format
```

## 테스트 (Web)

```bash
# 단위 테스트 (Vitest)
cd apps/web
yarn test                    # watch 모드
yarn test:run                # 1회 실행
yarn test:coverage           # 커버리지 포함

# E2E 테스트 (Playwright)
yarn e2e                     # headless
yarn e2e:ui                  # UI 모드
yarn e2e:headed              # headed 모드
```

## 테스트 (API)

```bash
cd apps/api
yarn test                    # Jest 단위 테스트
yarn test:watch              # watch 모드
yarn test:cov                # 커버리지
yarn test:e2e                # E2E 테스트
```

## Storybook (Web)

```bash
cd apps/web
yarn storybook               # 개발 서버 (port 6006)
yarn build-storybook         # 빌드
```

## 모바일 배포

```bash
# iOS
yarn mobile:build:ios        # iOS 빌드
yarn mobile:submit:ios       # App Store 제출
yarn mobile:deploy:ios       # 빌드 + 제출

# Android
yarn mobile:build:android    # Android 빌드
yarn mobile:submit:android   # Play Store 제출
yarn mobile:deploy:android   # 빌드 + 제출

# 전체
yarn mobile:build:all        # iOS + Android 빌드
```

## 프로덕션

```bash
yarn start                   # API 프로덕션 시작
```

## 시스템 유틸 (Darwin/macOS)

```bash
# Git
git status
git log --oneline -10
git diff
git checkout -b feature/xxx

# 파일 탐색
ls -la
find . -name "*.ts" -type f
grep -r "pattern" --include="*.ts"

# 프로세스
ps aux | grep node
lsof -i :3000
```

## 워크스페이스 관리

```bash
# 특정 워크스페이스에서 명령 실행
yarn workspace web <command>
yarn workspace api <command>

# 특정 패키지에 의존성 추가
yarn workspace web add <package>
yarn workspace api add <package>
```
