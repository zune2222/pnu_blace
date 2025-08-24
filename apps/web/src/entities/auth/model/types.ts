import { LoginRequestDto, LoginResponse, JwtPayload } from "@packages/types";

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

export type LoginCredentials = LoginRequestDto;

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export type { LoginResponse, JwtPayload };
