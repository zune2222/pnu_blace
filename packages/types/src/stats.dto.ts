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

// GET /stats/prediction/:roomNo/:setNo
export class SeatPredictionDto {
	roomNo: string;
	setNo: string;
	analysis: {
		currentPeriod: "NORMAL" | "EXAM" | "VACATION" | "FINALS";
		usageProfile: {
			durationHours: number;
			percentage: number;
		}[];
		summaryMessage: string;
	};
}

// POST /admin/calendar
export class CreateAcademicCalendarDto {
	name: string;
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	type: "NORMAL" | "EXAM" | "VACATION" | "FINALS";
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
