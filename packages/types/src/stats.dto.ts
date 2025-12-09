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
	tier: string; // 사용자의 티어 정보 (Explorer, Student, Scholar, Master, Legend, Myth)
}

// GET /stats/my-rank
export class MyRankInfoDto {
	// UserStats 기본 정보
	studentId: string;
	totalUsageHours: number;
	totalSessions: number;
	totalDays: number;
	averageSessionHours: number;
	favoriteRoomName?: string;
	favoriteRoomVisits: number;
	favoriteRoomHours: number;
	weeklyUsageHours: number;
	weeklySessions: number;
	weeklyDays: number;
	weekStartDate?: Date;
	tier: string;
	isPublicRanking: boolean;
	publicNickname?: string;
	createdAt: Date;
	updatedAt: Date;
	lastDataSyncAt?: Date;
	
	// 계산된 랭킹 정보
	totalUsers: number;
	hoursRank: number;
	sessionsRank: number;
	daysRank: number;
	hoursPercentile?: number;
	sessionsPercentile?: number;
	daysPercentile?: number;
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
