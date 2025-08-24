import { LoginRequestDto, LoginResponse } from "@packages/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class AuthApi {
  async login(credentials: LoginRequestDto): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("로그인에 실패했습니다");
    }

    return response.json();
  }

  async logout(): Promise<void> {
    // TODO: Implement logout API call if needed
    // Remove token from storage will be handled by auth hook
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("토큰 갱신에 실패했습니다");
    }

    return response.json();
  }
}

export const authApi = new AuthApi();
