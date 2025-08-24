import { IsString, IsNotEmpty } from "class-validator";

// POST /auth/login
export class LoginRequestDto {
	@IsString()
	@IsNotEmpty()
	studentId: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

// GET /users/me
export class UserProfileDto {
	studentId: string;
	name: string;
	major: string;
}
