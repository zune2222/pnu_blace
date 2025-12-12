import { authApi } from "../api/auth-api";
import { TokenManager } from "./token-manager";
import { LoginCredentials } from "../model/types";
import { logger } from "@/shared/lib/logger";

// User info extracted from JWT
interface AuthUser {
  studentId: string;
}

export class AuthManager {
  // JWT 토큰에서 payload를 디코딩
  private static decodeJwtPayload(token: string): { sub: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  }

  static async initialize(): Promise<{
    isAuthenticated: boolean;
    user: AuthUser | null;
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
      // JWT에서 studentId 파싱
      const payload = this.decodeJwtPayload(token);
      const user = payload ? { studentId: payload.sub } : null;
      
      return {
        isAuthenticated: true,
        user,
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
    user: AuthUser;
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
    } catch (err) {
      logger.error("Logout API failed:", err);
    } finally {
      TokenManager.clearToken();
    }
  }
}