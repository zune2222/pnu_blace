import { authApi } from "../api/auth-api";

export class TokenManager {
  static getCurrentToken(): string | null {
    return authApi.getCurrentToken();
  }

  static async validateToken(): Promise<boolean> {
    try {
      return await authApi.checkAuth();
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }

  static async refreshToken(): Promise<string> {
    const response = await authApi.refreshToken();
    return response.accessToken;
  }

  static clearToken(): void {
    // authApi의 clearToken 메서드가 있다면 호출
    // localStorage.removeItem('token') 등의 로직
  }
}