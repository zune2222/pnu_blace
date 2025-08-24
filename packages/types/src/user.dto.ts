// GET /users/me
export class UserProfileDto {
	studentId: string;
	name: string;
	major: string;
}

// 학교 API에서 받아오는 사용자 정보
export interface UserInfoFromAPI {
	userID: string;
	userName: string;
	deptName: string;
	patName: string;
	qrCode: string;
	photoUrl: string;
	mainNoti: string;
}
