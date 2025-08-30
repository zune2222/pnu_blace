import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ToggleFavoriteRequestDto,
  ToggleFavoriteResponseDto,
  FavoriteRoomsResponseDto,
} from '@pnu-blace/types';

@Controller('api/v1/favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * 내 즐겨찾기 열람실 목록 조회
   */
  @Get()
  async getMyFavorites(@Request() req): Promise<FavoriteRoomsResponseDto> {
    const user = req.user;
    return this.favoritesService.getFavoriteRooms(user.studentId);
  }

  /**
   * 즐겨찾기 토글 (추가/제거)
   */
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggleFavorite(
    @Request() req,
    @Body() request: ToggleFavoriteRequestDto,
  ): Promise<ToggleFavoriteResponseDto> {
    const user = req.user;
    return this.favoritesService.toggleFavorite(user.studentId, request);
  }

  /**
   * 특정 열람실 즐겨찾기 상태 확인
   */
  @Get('check/:roomNo')
  async checkFavorite(
    @Request() req,
    @Param('roomNo') roomNo: string,
  ): Promise<{ isFavorite: boolean }> {
    const user = req.user;
    const isFavorite = await this.favoritesService.isFavorite(
      user.studentId,
      roomNo,
    );
    return { isFavorite };
  }

  /**
   * 즐겨찾기에서 제거
   */
  @Delete(':roomNo')
  @HttpCode(HttpStatus.OK)
  async removeFavorite(
    @Request() req,
    @Param('roomNo') roomNo: string,
  ): Promise<ToggleFavoriteResponseDto> {
    const user = req.user;
    return this.favoritesService.toggleFavorite(user.studentId, {
      roomNo,
      isFavorite: false,
    });
  }
}
