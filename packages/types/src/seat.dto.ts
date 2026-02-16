import {
	IsString,
	IsNotEmpty,
	IsBoolean,
	IsNumber,
	IsOptional,
	IsEnum,
} from "class-validator";
import type {
	VacancyProbabilityBand,
	PredictionSegment,
	SurvivalPoint,
} from "./stats.dto";

// GET /seats/:roomNo
export class SeatStatusDto {
	seatNo: string;
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
	seatNo: string;
	startTime: string;
	endTime: string;
	remainingTime?: string;
	roomName?: string;
	seatDisplayName?: string;
}

// POST /seats/reserve
export class ReserveSeatRequestDto {
	@IsString()
	@IsNotEmpty()
	roomNo: string;

	@IsString()
	@IsNotEmpty()
	seatNo: string;

	@IsOptional()
	@IsBoolean()
	autoExtensionEnabled?: boolean;
}

// Response DTOs
export class SeatActionResponseDto {
	success: boolean;
	message: string;
	requiresGateEntry?: boolean;
}

export class ExtendSeatResponseDto {
	success: boolean;
	endTime: string;
	message: string;
}

// GET /seats/:roomNo/:seatNo/prediction
export class SeatVacancyPredictionDto {
	seatNo: string;
	predictedEndTime: string;
	confidence: number; // 0-1 사이의 값
	message: string;
	currentStatus?: "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";

	/** 현재 세션 시작 시각 (ISO 8601) */
	occupiedSince?: string;
	/** 현재까지 경과 시간(분) */
	elapsedMinutes?: number;
	/** 남은 사용시간 중앙값(분) */
	medianRemainingMinutes?: number;
	/** 남은 시간 범위 */
	remainingRange?: {
		/** 낙관적 추정 — 25% 분위수(분) */
		optimistic: number;
		/** 비관적 추정 — 75% 분위수(분) */
		pessimistic: number;
	};
	/** "N분 내 비워질 확률" 밴드 */
	probabilityBands?: VacancyProbabilityBand[];
	/** 예측에 사용된 세그먼트 정보 */
	segment?: PredictionSegment;
	/** 예측에 사용된 세션 샘플 수 */
	sampleSize?: number;
	/** 생존 곡선 (includeCurve=true 시) */
	survivalCurve?: SurvivalPoint[];
}

// 자동 연장 관련 DTOs
export class AutoExtensionConfigDto {
	isEnabled: boolean;
	triggerMinutesBefore: number;
	maxAutoExtensions: number;
	timeRestriction: "ALL_TIMES" | "WEEKDAYS" | "WEEKENDS";
	startTime?: string;
	endTime?: string;
}

export class UpdateAutoExtensionConfigDto {
	@IsOptional()
	@IsBoolean()
	isEnabled?: boolean;

	@IsOptional()
	@IsNumber()
	triggerMinutesBefore?: number;

	@IsOptional()
	@IsNumber()
	maxAutoExtensions?: number;

	@IsOptional()
	@IsEnum(["ALL_TIMES", "WEEKDAYS", "WEEKENDS"])
	timeRestriction?: "ALL_TIMES" | "WEEKDAYS" | "WEEKENDS";

	@IsOptional()
	@IsString()
	startTime?: string;

	@IsOptional()
	@IsString()
	endTime?: string;
}

export class AutoExtensionStatsDto {
	isEnabled: boolean;
	currentExtensionCount: number;
	maxAutoExtensions: number;
	remainingExtensions: number;
	lastExtendedAt?: Date;
	nextTriggerMinutes?: number;
}

// 대기열 관련 DTOs
export class QueueRequestDto {
	queueId: number;
	requestType: "AUTO_EXTENSION" | "SEAT_RESERVATION";
	status: "WAITING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELED";
	queuePosition: number;
	roomNo?: string;
	seatNo?: string;
	scheduledAt?: Date;
	createdAt: Date;
}

export class AddToQueueRequestDto {
	@IsOptional()
	@IsString()
	roomNo?: string;

	@IsOptional()
	@IsString()
	seatNo?: string;

	@IsOptional()
	scheduledAt?: Date;
}

export class QueueStatusDto {
	autoExtension?: QueueRequestDto;
	seatReservation?: QueueRequestDto;
	totalWaiting: number;
}

export class QueueStatsDto {
	totalWaiting: number;
	totalProcessing: number;
	autoExtensionWaiting: number;
	seatReservationWaiting: number;
	avgProcessingTime: number;
}
