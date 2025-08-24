# 배포 가이드

이 프로젝트는 API를 Railway에, Web을 Vercel에 배포하도록 설정되어 있습니다.

## 설정 방법

### 1. Railway 설정 (API)

1. [Railway](https://railway.app)에 가입하고 새 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `DATABASE_URL`: PostgreSQL 데이터베이스 URL
   - `JWT_SECRET`: JWT 시크릿 키
   - `SCHOOL_API_USERNAME`: 학교 API 사용자명
   - `SCHOOL_API_PASSWORD`: 학교 API 비밀번호

### 2. Vercel 설정 (Web)

1. [Vercel](https://vercel.com)에 가입하고 새 프로젝트 생성
2. GitHub 저장소 연결
3. 프로젝트 설정에서:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && yarn workspace web build`
   - Output Directory: `.next`

### 3. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정:

#### Railway Secrets

- `RAILWAY_TOKEN`: Railway API 토큰
- `RAILWAY_SERVICE_ID`: Railway 서비스 ID

#### Vercel Secrets

- `VERCEL_TOKEN`: Vercel API 토큰
- `VERCEL_ORG_ID`: Vercel 조직 ID
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID

## 배포 프로세스

1. `main` 브랜치에 푸시하면 자동으로 배포됩니다
2. API는 Railway에서 포트 8080으로 실행됩니다
3. Web은 Vercel에서 실행되며, API URL을 환경 변수로 설정해야 합니다

## 환경 변수

### Web 앱 환경 변수 (Vercel)

```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

### API 앱 환경 변수 (Railway)

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
SCHOOL_API_USERNAME=your-username
SCHOOL_API_PASSWORD=your-password
PORT=8080
```

## 수동 배포

### API 수동 배포

```bash
cd apps/api
railway up
```

### Web 수동 배포

```bash
cd apps/web
vercel --prod
```

## 헬스체크

API 헬스체크 엔드포인트: `GET /health`

응답 예시:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```
