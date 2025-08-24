// 좌석 스냅샷 (특정 시점의 좌석 상태)
export interface SeatSnapshot {
	roomNo: string;
	setNo: string;
	status: "OCCUPIED" | "AVAILABLE" | "UNAVAILABLE";
	timestamp: Date;
}

// 자동 예약 요청
export interface ReservationRequest {
	studentId: string;
	roomNo: string;
	setNo: string;
	requestedAt: Date;
}

// 자동 예약 결과
export interface ReservationResult {
	success: boolean;
	studentId: string;
	roomNo: string;
	setNo: string;
	message: string;
	timestamp: Date;
	reservedAt?: Date;
	error?: string;
}

// 좌석 상태 변화 이벤트
export interface SeatChangeEvent {
	roomNo: string;
	setNo: string;
	previousStatus: string;
	currentStatus: string;
	event: "OCCUPIED" | "VACATED";
	timestamp: Date;
}
