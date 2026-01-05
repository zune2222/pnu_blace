import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/nestjs';

async function bootstrap() {
  // Sentry 초기화
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    debug: process.env.NODE_ENV === 'development',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule, {
    logger: isProduction 
      ? ['error', 'warn', 'log'] 
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000', // 개발 환경 프론트엔드
      'https://pnu-blace.vercel.app', // 프로덕션 프론트엔드 (나중에 실제 도메인으로 변경)
      'https://pnu-blace.com', // 프로덕션 도메인
      'https://www.pnu-blace.com', // www 서브도메인
      process.env.FRONTEND_URL, // 환경변수로 지정된 프론트엔드 URL
    ].filter(Boolean), // undefined 값 제거
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(process.env.PORT ?? 8080); // 포트를 3001로 변경 (프론트엔드와 겹치지 않게)
}
bootstrap();
