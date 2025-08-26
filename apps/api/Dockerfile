# 멀티스테이지 Docker 빌드  
FROM node:20-alpine AS deps

# 작업 디렉토리 설정
WORKDIR /app

# 루트 package.json과 yarn.lock 복사
COPY package.json yarn.lock ./

# 필요한 패키지 복사
COPY packages/db/ ./packages/db/
COPY packages/types/ ./packages/types/  
COPY apps/api/ ./apps/api/

# eslint-config 제외하고 의존성 설치
RUN yarn install --frozen-lockfile --ignore-optional

# 빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app

# deps 스테이지에서 전체 복사
COPY --from=deps /app .

# API와 필요한 패키지만 빌드
RUN yarn build:api

# 런타임 스테이지
FROM node:20-alpine AS runtime
WORKDIR /app/apps/api

# 빌드된 API 복사
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json ./package.json

# 포트 노출
EXPOSE 8080

# API 실행
CMD ["yarn", "start:prod"]