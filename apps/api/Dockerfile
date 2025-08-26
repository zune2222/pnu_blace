# 멀티스테이지 Docker 빌드
FROM node:20-alpine AS deps

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일들 복사
COPY package.json yarn.lock ./
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json

# 의존성 설치
RUN yarn install --frozen-lockfile --ignore-scripts

# 소스 코드 복사
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# 빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app

# deps 스테이지에서 복사
COPY --from=deps /app .

# API와 필요한 패키지만 빌드
RUN yarn build:api

# 런타임 스테이지
FROM node:20-alpine AS runtime
WORKDIR /app

# 운영용 패키지만 설치
COPY package.json yarn.lock ./
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN yarn install --frozen-lockfile --production --ignore-scripts

# 빌드된 파일들 복사
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/types/dist ./packages/types/dist
COPY --from=build /app/apps/api/dist ./apps/api/dist

# API 소스 파일 복사 (런타임에 필요한 것들)
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules

# 포트 노출
EXPOSE 8080

# API 실행
WORKDIR /app/apps/api
CMD ["yarn", "start:prod"]