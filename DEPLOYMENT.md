# PNU Blace 배포 가이드

## 개요

- **프론트엔드**: Vercel 배포
- **백엔드**: Railway 배포
- **타입 공유**: Turborepo의 packages/types를 통한 type-safe API 연결

## 백엔드 배포 (Railway)

### 1. Railway 프로젝트 생성

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 생성
railway init
```

### 2. 환경변수 설정

Railway 대시보드에서 다음 환경변수 설정:

```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 3. 배포

```bash
# railway.json 파일이 있는 apps/api 디렉토리에서
railway up
```

배포된 URL: `https://your-app.railway.app`

## 프론트엔드 배포 (Vercel)

### 1. Vercel 프로젝트 연결

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 배포
vercel

# vercel.json 설정이 자동으로 Turborepo 빌드 실행
```

### 2. 환경변수 설정

Vercel 대시보드에서 환경변수 설정:

```
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

### 3. 도메인 확인

배포된 URL: `https://your-project.vercel.app`

## Turborepo의 장점

### 1. Type Safety

```typescript
// packages/types에 한 번 정의
export interface LoginRequestDto {
  studentId: string;
  password: string;
}

// 프론트/백엔드 모두에서 동일한 타입 사용
import { LoginRequestDto } from "@packages/types";
```

### 2. 공유 컴포넌트

```typescript
// packages/ui의 공통 컴포넌트를 여러 앱에서 사용
import { Button } from "@packages/ui";
```

### 3. 통합 개발 환경

```bash
# 전체 프로젝트 동시 실행
yarn dev

# 타입 체크
yarn type-check

# 전체 빌드
yarn build
```

## API 연결 최적화

### 1. 강화된 API 클라이언트

- 자동 토큰 관리
- 타임아웃 설정
- 구체적인 에러 처리
- TypeScript 타입 안전성

### 2. 인증 플로우

```typescript
// 로그인 시 자동 토큰 저장
const response = await authApi.login(credentials);
// 모든 후속 API 요청에 자동 토큰 포함

// 토큰 만료 시 자동 갱신
await authApi.refreshToken();
```

### 3. 에러 처리

```typescript
try {
  await authApi.login(credentials);
} catch (error) {
  // 구체적인 에러 메시지 표시
  if (error.status === 401) {
    setError("학번 또는 비밀번호가 올바르지 않습니다");
  }
}
```

## 로컬 개발 환경

### 1. 환경변수 설정

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001

# apps/api/.env
DATABASE_URL=postgresql://localhost:5432/pnu_blace
JWT_SECRET=your-local-jwt-secret
```

### 2. 개발 서버 실행

```bash
# 루트 디렉토리에서
yarn dev

# 또는 개별 실행
yarn workspace web dev     # 프론트엔드
yarn workspace api dev     # 백엔드
```

## 배포 체크리스트

### Railway (백엔드)

- [ ] 환경변수 설정 완료
- [ ] 데이터베이스 연결 확인
- [ ] 헬스체크 엔드포인트 작동 확인
- [ ] CORS 설정 (Vercel 도메인 허용)

### Vercel (프론트엔드)

- [ ] NEXT_PUBLIC_API_URL 환경변수 설정
- [ ] Turborepo 빌드 명령어 확인
- [ ] 프로덕션 빌드 테스트

### 연동 테스트

- [ ] 프론트엔드에서 백엔드 API 호출 가능
- [ ] 로그인/로그아웃 플로우 정상 작동
- [ ] 에러 처리 및 사용자 피드백 확인

## 트러블슈팅

### 일반적인 문제

1. **CORS 에러**: Railway에서 CORS_ORIGIN 환경변수 확인
2. **API 연결 실패**: NEXT_PUBLIC_API_URL 환경변수 확인
3. **빌드 실패**: Turborepo workspace 의존성 확인
4. **타입 에러**: packages/types 빌드 순서 확인

### 로그 확인

```bash
# Railway 로그
railway logs

# Vercel 로그
vercel logs [deployment-url]
```
