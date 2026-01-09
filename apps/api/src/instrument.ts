/**
 * Sentry 초기화 설정
 * 반드시 다른 모듈보다 먼저 import 되어야 함
 */
import * as Sentry from '@sentry/nestjs';

const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  debug: !isProduction,

  beforeSend(event) {
    if (!isProduction) return event;

    // 프로덕션에서 민감 정보 제거
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});

export { isProduction };
