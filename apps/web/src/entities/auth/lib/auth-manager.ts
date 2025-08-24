import { authApi } from "../api/auth-api";
import { TokenManager } from "./token-manager";
import { LoginCredentials } from "../model/types";

export class AuthManager {
  static async initialize(): Promise<{
    isAuthenticated: boolean;
    user: any;
    token: string | null;
  }> {
    const token = TokenManager.getCurrentToken();
    
    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }

    const isValid = await TokenManager.validateToken();
    if (isValid) {
      return {
        isAuthenticated: true,
        user: null, // JWT에서 파싱하거나 별도 API 호출
        token,
      };
    }

    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }

  static async login(credentials: LoginCredentials): Promise<{
    user: any;
    token: string;
  }> {
    const response = await authApi.login(credentials);
    
    const user = {
      studentId: credentials.studentId,
      // JWT에서 추가 정보 파싱 또는 별도 API 호출
    };

    return {
      user,
      token: response.accessToken,
    };
  }

  static async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      TokenManager.clearToken();
    }
  }
}