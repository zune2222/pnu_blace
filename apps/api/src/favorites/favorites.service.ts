import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteRoom } from '@pnu-blace/db';
import {
  FavoriteRoomDto,
  ToggleFavoriteRequestDto,
  ToggleFavoriteResponseDto,
  FavoriteRoomsResponseDto,
} from '@pnu-blace/types';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    @InjectRepository(FavoriteRoom)
    private readonly favoriteRoomRepository: Repository<FavoriteRoom>,
  ) {}

  /**
   * 사용자의 즐겨찾기 열람실 목록 조회
   */
  async getFavoriteRooms(studentId: string): Promise<FavoriteRoomsResponseDto> {
    try {
      const favoriteRooms = await this.favoriteRoomRepository.find({
        where: { studentId },
        order: { createdAt: 'DESC' },
      });

      const favoriteRoomDtos: FavoriteRoomDto[] = favoriteRooms.map(
        (room: FavoriteRoom) => ({
          id: room.id,
          studentId: room.studentId,
          roomNo: room.roomNo,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        }),
      );

      this.logger.debug(
        `Found ${favoriteRoomDtos.length} favorite rooms for user ${studentId}`,
      );

      return {
        success: true,
        data: favoriteRoomDtos,
        message: '즐겨찾기 목록을 성공적으로 조회했습니다.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get favorite rooms for user ${studentId}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 즐겨찾기 토글 (추가/제거)
   */
  async toggleFavorite(
    studentId: string,
    request: ToggleFavoriteRequestDto,
  ): Promise<ToggleFavoriteResponseDto> {
    try {
      const { roomNo, isFavorite } = request;

      if (isFavorite) {
        // 즐겨찾기 추가
        const existingFavorite = await this.favoriteRoomRepository.findOne({
          where: { studentId, roomNo },
        });

        if (existingFavorite) {
          return {
            success: true,
            message: '이미 즐겨찾기에 추가된 열람실입니다.',
            isFavorite: true,
          };
        }

        const newFavorite = this.favoriteRoomRepository.create({
          studentId,
          roomNo,
        });

        await this.favoriteRoomRepository.save(newFavorite);

        this.logger.debug(
          `Added room ${roomNo} to favorites for user ${studentId}`,
        );

        return {
          success: true,
          message: '즐겨찾기에 추가되었습니다.',
          isFavorite: true,
        };
      } else {
        // 즐겨찾기 제거
        const result = await this.favoriteRoomRepository.delete({
          studentId,
          roomNo,
        });

        if (result.affected === 0) {
          return {
            success: true,
            message: '즐겨찾기에 없는 열람실입니다.',
            isFavorite: false,
          };
        }

        this.logger.debug(
          `Removed room ${roomNo} from favorites for user ${studentId}`,
        );

        return {
          success: true,
          message: '즐겨찾기에서 제거되었습니다.',
          isFavorite: false,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to toggle favorite for user ${studentId}: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  /**
   * 특정 열람실이 즐겨찾기인지 확인
   */
  async isFavorite(studentId: string, roomNo: string): Promise<boolean> {
    try {
      const favorite = await this.favoriteRoomRepository.findOne({
        where: { studentId, roomNo },
      });

      return !!favorite;
    } catch (error) {
      this.logger.error(
        `Failed to check favorite status for user ${studentId}, room ${roomNo}: ${this.getErrorMessage(error)}`,
      );
      return false;
    }
  }

  /**
   * 에러 메시지 추출 헬퍼
   */
  private getErrorMessage(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
