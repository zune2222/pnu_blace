// 학사일정 기간 타입 정의
export type PeriodType = "NORMAL" | "EXAM" | "VACATION" | "FINALS";

// GET /stats/me
export class MyUsageStatsDto {
	totalUsageHours: number;
	totalSessions: number;
	averageSessionHours: number;
	mostUsedRoom: string;
	mostUsedRoomName: string;
	todayHours: number; // 오늘 이용 시간
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

// Survival Analysis Types

/** 생존 곡선의 한 점 */
export interface SurvivalPoint {
	/** 세션 시작 이후 경과 시간(분) */
	minutesFromStart: number;
	/** 해당 시점에서 아직 사용 중일 확률 (0-1) */
	survivalProbability: number;
	/** 이 구간에 기여한 세션 수 */
	sampleSize: number;
}

/** "N분 내 비워질 확률" 밴드 */
export interface VacancyProbabilityBand {
	/** 기준 시간(분) */
	withinMinutes: number;
	/** 해당 시간 내에 비워질 확률 (0-1) */
	probability: number;
}

/** 생존분석 예측 결과 */
export interface SurvivalPredictionResult {
	/** 남은 사용시간 중앙값(분) */
	medianRemainingMinutes: number;
	/** 25% 분위수 — 낙관적 추정(분) */
	q25RemainingMinutes: number;
	/** 75% 분위수 — 비관적 추정(분) */
	q75RemainingMinutes: number;
	/** 확률 밴드 배열 */
	probabilityBands: VacancyProbabilityBand[];
	/** 예측 신뢰도 (0-1), 샘플 수 기반 */
	confidence: number;
	/** 생존 곡선 (프론트엔드 차트용, 선택적) */
	survivalCurve?: SurvivalPoint[];
}

/** 예측에 사용된 세그먼트 키 */
export interface PredictionSegment {
	periodType: PeriodType | "ALL";
	startHourBucket: string;
	dayType: "WEEKDAY" | "WEEKEND" | "ALL";
	roomNo?: string;
}
