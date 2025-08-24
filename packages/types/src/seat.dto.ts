import { IsString, IsNotEmpty } from "class-validator";

// GET /seats/:roomNo
export class SeatStatusDto {
	setNo: string;
	status: "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";
}

// GET /seats/:roomNo/detail
export class SeatDetailDto {
	roomNo: string;
	roomName: string;
	totalSeats: number;
	occupiedSeats: string[];
	unavailableSeats: string[];
	availableSeats: string[];
	seats: SeatStatusDto[];
	backgroundImageUrl?: string;
}

// GET /seats/my-seat
export class MySeatDto {
	roomNo: string;
	setNo: string;
	startTime: string;
	endTime: string;
}

// POST /seats/reserve
export class ReserveSeatRequestDto {
	@IsString()
	@IsNotEmpty()
	roomNo: string;

	@IsString()
	@IsNotEmpty()
	setNo: string;
}

// Response DTOs
export class SeatActionResponseDto {
	success: boolean;
	message: string;
}

export class ExtendSeatResponseDto {
	success: boolean;
	endTime: string;
	message: string;
}

// GET /seats/:roomNo/:setNo/prediction
export class SeatVacancyPredictionDto {
	setNo: string;
	predictedEndTime: string;
	confidence: number; // 0-1 사이의 값
	message: string;
}
