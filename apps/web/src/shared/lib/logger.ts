/**
 * 개발 환경 전용 로거
 * 프로덕션에서는 로그가 출력되지 않습니다.
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const formatArgs = (args: unknown[]): string => {
  return args
    .map((arg) =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(' ');
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    // 경고는 프로덕션에서도 출력
    console.warn('[WARN]', ...args);
  },

  error: (...args: unknown[]) => {
    // 에러는 프로덕션에서도 출력
    console.error('[ERROR]', ...args);
  },

  /**
   * 소켓 관련 로그 (이모지 포함)
   */
  socket: {
    connected: (id: string) => {
      if (isDev) console.log('🔗 Socket connected:', id);
    },
    disconnected: (reason: string) => {
      if (isDev) console.log('🔌 Socket disconnected:', reason);
    },
    message: (type: string, data?: unknown) => {
      if (isDev) console.log(`📩 ${type}:`, data);
    },
    error: (error: unknown) => {
      if (isDev) console.error('❌ Socket error:', error);
    },
    event: (emoji: string, message: string, data?: unknown) => {
      if (isDev) {
        if (data !== undefined) {
          console.log(`${emoji} ${message}:`, data);
        } else {
          console.log(`${emoji} ${message}`);
        }
      }
    },
  },
};

export default logger;
