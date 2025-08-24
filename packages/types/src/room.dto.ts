export interface RoomInfo {
	roomNo: string;
	roomName: string;
	useYN: string;
	timeStart: string;
	timeEnd: string;
	totalSeat: number;
	useSeat: number;
	remainSeat: number;
	useRate: number;
}

export interface RoomStatusResponse {
	resultCode: string;
	resultMsg: string;
	items: RoomInfo[];
}
