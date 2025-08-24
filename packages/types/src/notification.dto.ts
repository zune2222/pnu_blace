import { IsString, IsNotEmpty, IsBoolean } from "class-validator";

// POST /notifications
export class CreateNotificationRequestDto {
	@IsString()
	@IsNotEmpty()
	roomNo: string;

	@IsString()
	@IsNotEmpty()
	setNo: string;

	@IsBoolean()
	autoReserve: boolean;
}

// GET /notifications response
export class NotificationRequestDto {
	id: number;
	roomNo: string;
	setNo: string;
	autoReserve: boolean;
	createdAt: Date;
	isActive: boolean;
}

// Response DTOs
export class NotificationActionResponseDto {
	success: boolean;
	message: string;
}
