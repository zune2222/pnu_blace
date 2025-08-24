import { IsString, IsNotEmpty } from "class-validator";

// POST /auth/login 요청
export class LoginRequestDto {
	@IsString()
	@IsNotEmpty()
	studentId: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

// POST /auth/login 응답
export interface LoginResponse {
	accessToken: string;
}

// JWT 토큰 페이로드
export interface JwtPayload {
	sub: string; // studentId
	iat: number;
	exp: number;
}
