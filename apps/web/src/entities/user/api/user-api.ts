import { UserProfile } from "../model/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class UserApi {
  async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("사용자 정보를 가져올 수 없습니다");
    }

    return response.json();
  }
}

export const userApi = new UserApi();
