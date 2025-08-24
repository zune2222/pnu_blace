// 프론트엔드용 타입 정의 (백엔드 의존성 없음)
export interface LoginResponse {
  accessToken: string;
}

export interface JwtPayload {
  sub: string; // studentId
  iat: number;
  exp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    studentId: string;
    name?: string;
    major?: string;
  } | null;
  token: string | null;
  isLoading: boolean;
}

export interface LoginCredentials {
  studentId: string;
  password: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
}
