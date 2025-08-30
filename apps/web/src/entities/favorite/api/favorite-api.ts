"use client";

import { ReadingRoomInfo } from "@/entities/dashboard";
import { apiClient } from "@/lib/api";
import {
  ToggleFavoriteRequestDto,
  ToggleFavoriteResponseDto,
  FavoriteRoomsResponseDto,
  RoomInfo,
} from "@pnu-blace/types";

/**
 * 즐겨찾기 전용 API 서비스
 * 단일책임 원칙에 따라 즐겨찾기 관련 기능만 담당
 */
class FavoriteApi {
  private favoriteRooms: string[] = [];

  constructor() {
    this.loadFavoriteRooms();
  }

  /**
   * 즐겨찾기 목록 조회
   */
  async getFavoriteRooms(): Promise<ReadingRoomInfo[]> {
    try {
      console.log("즐겨찾기 목록 조회 시작");

      // 백엔드 API에서 즐겨찾기 목록 조회
      const response =
        await apiClient.get<FavoriteRoomsResponseDto>("/api/v1/favorites");

      console.log("즐겨찾기 API 응답:", response);

      if (!response.success) {
        throw new Error(
          response.message || "즐겨찾기 목록 조회에 실패했습니다"
        );
      }

      const favoriteRoomNos = response.data.map(
        (room: { roomNo: string }) => room.roomNo
      );

      console.log("즐겨찾기된 열람실 번호들:", favoriteRoomNos);

      // 모든 열람실 정보를 가져와서 즐겨찾기된 것만 필터링
      const allRooms = await this.getAllRooms();
      console.log("모든 열람실 정보:", allRooms);

      const favoriteRooms = allRooms.filter((room) =>
        favoriteRoomNos.includes(room.roomNo)
      );

      console.log("필터링된 즐겨찾기 열람실:", favoriteRooms);

      return favoriteRooms.map((room) => ({
        ...room,
        isFavorite: true,
      }));
    } catch (error) {
      console.error("즐겨찾기 목록 조회 실패:", error);
      // API 실패 시 로컬 스토리지에서 폴백
      return this.getFavoriteRoomsFromLocal();
    }
  }

  /**
   * 즐겨찾기 토글
   */
  async toggleFavorite(roomNo: string, isFavorite: boolean): Promise<void> {
    try {
      // 백엔드 API로 즐겨찾기 토글
      const request: ToggleFavoriteRequestDto = {
        roomNo,
        isFavorite,
      };

      const response = await apiClient.post<ToggleFavoriteResponseDto>(
        "/api/v1/favorites/toggle",
        request
      );

      if (!response.success) {
        throw new Error(response.message || "즐겨찾기 설정에 실패했습니다");
      }

      // 성공 시 로컬 상태도 업데이트
      if (isFavorite) {
        if (!this.favoriteRooms.includes(roomNo)) {
          this.favoriteRooms.push(roomNo);
        }
      } else {
        this.favoriteRooms = this.favoriteRooms.filter(
          (room) => room !== roomNo
        );
      }

      this.saveFavoriteRooms();
    } catch (error) {
      console.error("즐겨찾기 토글 실패:", error);
      // API 실패 시 로컬 스토리지에만 저장
      this.toggleFavoriteLocal(roomNo, isFavorite);
      throw new Error("즐겨찾기 설정에 실패했습니다");
    }
  }

  /**
   * 특정 열람실이 즐겨찾기인지 확인
   */
  async isFavorite(roomNo: string): Promise<boolean> {
    try {
      // 백엔드 API에서 확인
      const response = await apiClient.get<{ isFavorite: boolean }>(
        `/api/v1/favorites/check/${roomNo}`
      );
      return response.isFavorite;
    } catch (error) {
      console.error("즐겨찾기 상태 확인 실패:", error);
      // API 실패 시 로컬 스토리지에서 확인
      return this.favoriteRooms.includes(roomNo);
    }
  }

  /**
   * 즐겨찾기 목록을 로컬 스토리지에서 로드
   */
  private loadFavoriteRooms(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favoriteRooms");
      if (saved) {
        try {
          this.favoriteRooms = JSON.parse(saved);
        } catch (error) {
          console.warn("즐겨찾기 목록 로드 실패:", error);
          this.favoriteRooms = [];
        }
      }
    }
  }

  /**
   * 즐겨찾기 목록을 로컬 스토리지에 저장
   */
  private saveFavoriteRooms(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteRooms", JSON.stringify(this.favoriteRooms));
    }
  }

  /**
   * 즐겨찾기된 열람실 번호 목록 반환
   */
  private getFavoriteRoomNos(): string[] {
    return this.favoriteRooms;
  }

  /**
   * 로컬 스토리지에서 즐겨찾기 목록 조회 (폴백)
   */
  private async getFavoriteRoomsFromLocal(): Promise<ReadingRoomInfo[]> {
    const favoriteRoomNos = this.getFavoriteRoomNos();
    const allRooms = await this.getAllRooms();
    const favoriteRooms = allRooms.filter((room) =>
      favoriteRoomNos.includes(room.roomNo)
    );

    return favoriteRooms.map((room) => ({
      ...room,
      isFavorite: true,
    }));
  }

  /**
   * 로컬 스토리지에서 즐겨찾기 토글 (폴백)
   */
  private toggleFavoriteLocal(roomNo: string, isFavorite: boolean): void {
    if (isFavorite) {
      if (!this.favoriteRooms.includes(roomNo)) {
        this.favoriteRooms.push(roomNo);
      }
    } else {
      this.favoriteRooms = this.favoriteRooms.filter((room) => room !== roomNo);
    }
    this.saveFavoriteRooms();
  }

  /**
   * 모든 열람실 정보 조회 (실제 API에서 가져옴)
   */
  private async getAllRooms(): Promise<ReadingRoomInfo[]> {
    try {
      // 실제 API에서 열람실 정보 조회
      const rooms = await apiClient.get<RoomInfo[]>("/api/v1/rooms");

      // API 응답을 ReadingRoomInfo 형식으로 변환
      return rooms.map((room) => ({
        roomNo: room.roomNo,
        roomName: room.roomName,
        location: "중앙도서관", // 기본값 사용
        seats: [],
        totalSeats: room.totalSeat,
        availableSeats: room.remainSeat,
        occupancyRate: room.useRate,
        operatingHours: {
          open: room.timeStart || "06:00",
          close: room.timeEnd || "24:00",
        },
        isOpen: room.useYN === "Y", // useYN이 Y면 운영중
        isFavorite: false,
      }));
    } catch (error) {
      console.error("열람실 정보 조회 실패:", error);
      // API 실패 시 기본 목업 데이터 반환
      return [
        {
          roomNo: "A101",
          roomName: "1F 제1열람실",
          location: "중앙도서관 1층",
          seats: [],
          totalSeats: 200,
          availableSeats: 150,
          occupancyRate: 25,
          operatingHours: { open: "06:00", close: "24:00" },
          isOpen: true,
          isFavorite: false,
        },
        {
          roomNo: "A201",
          roomName: "2F 제2열람실-A",
          location: "중앙도서관 2층",
          seats: [],
          totalSeats: 180,
          availableSeats: 90,
          occupancyRate: 50,
          operatingHours: { open: "06:00", close: "24:00" },
          isOpen: true,
          isFavorite: false,
        },
        {
          roomNo: "A202",
          roomName: "2F 새벽별당-A",
          location: "중앙도서관 2층",
          seats: [],
          totalSeats: 120,
          availableSeats: 30,
          occupancyRate: 75,
          operatingHours: { open: "06:00", close: "24:00" },
          isOpen: true,
          isFavorite: false,
        },
        {
          roomNo: "A301",
          roomName: "3F 제3열람실-A",
          location: "중앙도서관 3층",
          seats: [],
          totalSeats: 160,
          availableSeats: 20,
          occupancyRate: 87.5,
          operatingHours: { open: "06:00", close: "22:00" },
          isOpen: true,
          isFavorite: false,
        },
        {
          roomNo: "A401",
          roomName: "4F 제4열람실-A",
          location: "중앙도서관 4층",
          seats: [],
          totalSeats: 140,
          availableSeats: 140,
          occupancyRate: 0,
          operatingHours: { open: "06:00", close: "22:00" },
          isOpen: false,
          isFavorite: false,
        },
      ];
    }
  }
}

export const favoriteApi = new FavoriteApi();
