// 학교 API 로그인 결과
export interface LoginResult {
	success: boolean;
	userID?: string;
	sessionID?: string;
	errorMessage?: string;
}

// 좌석 정보
export interface SeatInfo {
	seatNo: string;
	status: "OCCUPIED" | "AVAILABLE" | "UNAVAILABLE";
}

// 내 좌석 정보
export interface MySeatInfo {
	roomNo: string;
	seatNo: string;
	startTime: string;
	endTime: string;
}
