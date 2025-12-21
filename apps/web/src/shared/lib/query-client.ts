import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5분간 캐시 유지
        staleTime: 1000 * 60 * 5,
        // 10분 후 가비지 컬렉션
        gcTime: 1000 * 60 * 10,
        // 네트워크 에러 시 3번까지 재시도
        retry: (failureCount, error) => {
          // API 에러가 아닌 네트워크 에러만 재시도
          if (error instanceof Error && error.message.includes('네트워크')) {
            return failureCount < 3;
          }
          return false;
        },
        // 재시도 지연 시간 (지수 백오프)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 포커스 시 자동 재요청 비활성화 (개발 중에는)
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 뮤테이션 에러 시 1번만 재시도
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Server/Client 환경에 맞는 QueryClient 반환
 * - Server: 매 요청마다 새 인스턴스 (request isolation)
 * - Browser: 싱글톤 유지 (hydration 호환)
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: 항상 새로운 client
    return makeQueryClient();
  } else {
    // Browser: 싱글톤 유지
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// 기존 호환성을 위해 유지 (deprecated)
export const queryClient = typeof window !== 'undefined' 
  ? getQueryClient() 
  : makeQueryClient();