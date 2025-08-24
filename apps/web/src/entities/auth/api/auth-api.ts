import { apiClient, ApiError } from "@/lib/api";
import { LoginCredentials, LoginResponse } from "../model/types";

class AuthApi {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      // 토큰을 자동으로 저장
      if (response.accessToken) {
        apiClient.setAuthToken(response.accessToken);
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        // 구체적인 에러 메시지 처리
        switch (error.status) {
          case 401:
            throw new Error("학번 또는 비밀번호가 올바르지 않습니다");
          case 429:
            throw new Error(
              "너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요"
            );
          case 500:
            throw new Error(
              "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요"
            );
          default:
            throw new Error(error.message || "로그인에 실패했습니다");
        }
      }
      throw new Error("네트워크 연결을 확인해주세요");
    }
  }

  async logout(): Promise<void> {
    try {
      // 서버에 로그아웃 요청 (선택사항)
      await apiClient.post("/auth/logout");
    } catch (error) {
      // 로그아웃 실패해도 로컬 토큰은 제거
      console.warn("로그아웃 API 호출 실패:", error);
    } finally {
      // 로컬 토큰 제거
      apiClient.removeAuthToken();
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/refresh");

      // 새 토큰 저장
      if (response.accessToken) {
        apiClient.setAuthToken(response.accessToken);
      }

      return response;
    } catch (error) {
      // 토큰 갱신 실패시 로그아웃
      apiClient.removeAuthToken();

      if (error instanceof ApiError && error.status === 401) {
        throw new Error("세션이 만료되었습니다. 다시 로그인해주세요");
      }
      throw new Error("인증 갱신에 실패했습니다");
    }
  }

  async checkAuth(): Promise<boolean> {
    try {
      const token = apiClient.getAuthToken();
      if (!token) return false;

      // 토큰 유효성 검사 (선택사항)
      await apiClient.get("/auth/me");
      return true;
    } catch (error) {
      // 인증 실패시 토큰 제거
      apiClient.removeAuthToken();
      return false;
    }
  }

  getCurrentToken(): string | null {
    return apiClient.getAuthToken();
  }
}

export const authApi = new AuthApi();
