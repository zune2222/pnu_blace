// 즐겨찾기 관련 DTO

export interface FavoriteRoomDto {
	id: number;
	studentId: string;
	roomNo: string;
	createdAt: string;
	updatedAt: string;
}

export interface ToggleFavoriteRequestDto {
	roomNo: string;
	isFavorite: boolean;
}

export interface ToggleFavoriteResponseDto {
	success: boolean;
	message: string;
	isFavorite: boolean;
}

export interface FavoriteRoomsResponseDto {
	success: boolean;
	data: FavoriteRoomDto[];
	message?: string;
}
