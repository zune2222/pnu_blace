// 학사일정 기간 타입 정의
export type PeriodType = "NORMAL" | "EXAM" | "VACATION" | "FINALS";

// GET /stats/me
export class MyUsageStatsDto {
	totalUsageHours: number;
	totalSessions: number;
	averageSessionHours: number;
	mostUsedRoom: string;
	mostUsedRoomName: string;
	thisWeekHours: number;
	thisMonthHours: number;
	favoriteTimeSlots: {
		hour: number;
		count: number;
	}[];
}

// GET /stats/prediction/:roomNo/:seatNo
export class SeatPredictionDto {
	roomNo: string;
	seatNo: string;
	analysis: {
		currentPeriod: PeriodType;
		totalEvents: number;
		averageUtilization: number;
		peakHours: string[];
		recommendedTimes: string[];
	};
}

// POST /admin/calendar
export class CreateAcademicCalendarDto {
	name: string;
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	type: PeriodType;
	description?: string;
}

// Response DTOs
export class CalendarActionResponseDto {
	success: boolean;
	message: string;
}

// 사용 패턴 분석용 인터페이스
export interface UsagePattern {
	durationHours: number;
	count: number;
}
