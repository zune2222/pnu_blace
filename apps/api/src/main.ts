// Sentry 초기화 (반드시 최상단에서 import)
import './instrument';
import { isProduction } from './instrument';

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://pnu-blace.vercel.app',
      'https://pnu-blace.com',
      'https://www.pnu-blace.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Sentry 전역 에러 필터
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryGlobalFilter(httpAdapter));

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap();
