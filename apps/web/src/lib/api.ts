import { RoomInfo } from "@pnu-blace/types";

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_TIMEOUT = 10000; // 10초

// API 에러 타입
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 인증 토큰 관리
class TokenManager {
  private static readonly TOKEN_KEY = "auth_token";

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean; noRedirect?: boolean } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = TokenManager.getToken();
    const { skipAuth, noRedirect, ...fetchOptions } = options;

    // 기본 헤더 설정
    const headers = new Headers({
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    });

    // 인증 토큰 추가 (skipAuth가 아닐 때만)
    if (token && !skipAuth) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // 타임아웃 설정
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 에러 처리
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // 401 에러 시 자동 로그아웃 및 리다이렉트 (인증 필요 API에서만, noRedirect가 아닐 때)
        if (response.status === 401 && !skipAuth && !noRedirect) {
          TokenManager.removeToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }

        throw new ApiError(
          response.status,
          errorData.message || `HTTP Error: ${response.status}`,
          errorData
        );
      }

      // JSON 응답 파싱
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(408, "요청 시간이 초과되었습니다");
      }

      throw new ApiError(0, "네트워크 오류가 발생했습니다");
    }
  }

  async get<T>(
    endpoint: string,
    options?: { skipAuth?: boolean; noRedirect?: boolean }
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  // Public API용 (토큰 없이 호출)
  async publicGet<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", skipAuth: true });
  }

  // 인증 체크용 (401시 리다이렉트 안함)
  async authCheck<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", noRedirect: true });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // 헬스체크
  async healthCheck() {
    return this.get("/health");
  }

  // 열람실 목록 조회
  async getRooms(): Promise<RoomInfo[]> {
    return this.get<RoomInfo[]>("/api/v1/rooms");
  }

  // 토큰 관리 메서드
  setAuthToken(token: string) {
    TokenManager.setToken(token);
  }

  removeAuthToken() {
    TokenManager.removeToken();
  }

  getAuthToken() {
    return TokenManager.getToken();
  }
}

export const apiClient = new ApiClient();
export { TokenManager };
