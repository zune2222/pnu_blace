import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudyService } from './study.service';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateStudyGroupDto,
  UpdateStudyGroupDto,
  JoinStudyRequestDto,
  JoinStudyWithPasswordDto,
  JoinStudyWithCodeDto,
  StudyGroupListResponse,
  StudyGroupDetail,
  TodayAttendancePublic,
  MyStudyGroupListResponse,
  StudyActionResponse,
} from '@pnu-blace/types';

// ==================== Public API (비로그인 접근 가능) ====================

@Controller('api/v1/study-groups/public')
export class StudyPublicController {
  constructor(private readonly studyService: StudyService) {}

  /**
   * 공개 스터디 목록 조회
   */
  @Get()
  async getPublicStudyGroups(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('tags') tags?: string,
  ): Promise<StudyGroupListResponse> {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const tagArray = tags ? tags.split(',') : undefined;

    return this.studyService.getPublicStudyGroups(
      pageNum,
      limitNum,
      search,
      tagArray,
    );
  }

  /**
   * 스터디 상세 정보 조회
   */
  @Get(':id')
  async getStudyGroupDetail(
    @Param('id') groupId: string,
  ): Promise<StudyGroupDetail> {
    return this.studyService.getStudyGroupDetail(groupId);
  }

  /**
   * 오늘의 출퇴근 현황 조회
   */
  @Get(':id/attendance')
  async getTodayAttendance(
    @Param('id') groupId: string,
  ): Promise<TodayAttendancePublic[]> {
    return this.studyService.getTodayAttendance(groupId);
  }

  /**
   * 스터디 검색
   */
  @Get('search')
  async searchStudyGroups(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<StudyGroupListResponse> {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 50);

    return this.studyService.searchStudyGroups(query, pageNum, limitNum);
  }

  /**
   * 인기 태그 목록
   */
  @Get('tags/popular')
  async getPopularTags(): Promise<{ tag: string; count: number }[]> {
    return this.studyService.getPopularTags();
  }
}

// ==================== 인증 필요 API ====================

@Controller('api/v1/study-groups')
@UseGuards(JwtAuthGuard)
export class StudyController {
  constructor(
    private readonly studyService: StudyService,
    private readonly attendanceService: AttendanceService,
  ) {}

  /**
   * 스터디 생성
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStudyGroup(
    @Request() req,
    @Body() dto: CreateStudyGroupDto,
  ): Promise<StudyGroupDetail> {
    return this.studyService.createStudyGroup(req.user.studentId, dto);
  }

  /**
   * 내 스터디 목록 조회
   */
  @Get('my')
  async getMyStudyGroups(@Request() req): Promise<MyStudyGroupListResponse> {
    return this.studyService.getMyStudyGroups(req.user.studentId);
  }

  /**
   * 스터디 수정
   */
  @Put(':id')
  async updateStudyGroup(
    @Request() req,
    @Param('id') groupId: string,
    @Body() dto: UpdateStudyGroupDto,
  ): Promise<StudyGroupDetail> {
    return this.studyService.updateStudyGroup(groupId, req.user.studentId, dto);
  }

  /**
   * 스터디 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteStudyGroup(
    @Request() req,
    @Param('id') groupId: string,
  ): Promise<void> {
    return this.studyService.deleteStudyGroup(groupId, req.user.studentId);
  }

  /**
   * 참가 신청 (공개 스터디)
   */
  @Post(':id/join')
  async requestJoin(
    @Request() req,
    @Param('id') groupId: string,
    @Body() dto: JoinStudyRequestDto,
  ): Promise<StudyActionResponse> {
    const result = await this.studyService.requestJoin(
      groupId,
      req.user.studentId,
      dto.displayName,
      dto.message,
    );

    return {
      success: true,
      message: '참가 신청이 완료되었습니다.',
      data: result,
    };
  }

  /**
   * 비밀번호로 가입
   */
  @Post(':id/join-password')
  async joinWithPassword(
    @Request() req,
    @Param('id') groupId: string,
    @Body() dto: JoinStudyWithPasswordDto,
  ): Promise<StudyActionResponse> {
    await this.studyService.joinWithPassword(
      groupId,
      req.user.studentId,
      dto.password,
      dto.displayName,
    );

    return {
      success: true,
      message: '스터디에 가입되었습니다.',
    };
  }

  /**
   * 초대 코드로 가입
   */
  @Post('join-code')
  async joinWithInviteCode(
    @Request() req,
    @Body() dto: JoinStudyWithCodeDto,
  ): Promise<StudyActionResponse> {
    const result = await this.studyService.joinWithInviteCode(
      dto.inviteCode,
      req.user.studentId,
      dto.displayName,
    );

    return {
      success: true,
      message: '스터디에 가입되었습니다.',
      data: result,
    };
  }

  /**
   * 스터디 탈퇴
   */
  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveStudyGroup(
    @Request() req,
    @Param('id') groupId: string,
  ): Promise<void> {
    return this.studyService.leaveStudyGroup(groupId, req.user.studentId);
  }

  /**
   * 초대 코드 조회 (멤버만)
   */
  @Get(':id/invite-code')
  async getInviteCode(
    @Request() req,
    @Param('id') groupId: string,
  ): Promise<{ inviteCode: string }> {
    const inviteCode = await this.studyService.getInviteCode(
      groupId,
      req.user.studentId,
    );

    return { inviteCode };
  }

  /**
   * 스터디 그룹 내 모든 멤버의 연속성 통계 조회
   */
  @Get(':id/streak-stats')
  async getGroupStreakStats(
    @Request() req,
    @Param('id') groupId: string,
  ) {
    // 연속성 통계는 멤버만 볼 수 있도록 AttendanceService에서 처리
    return this.attendanceService.getGroupStreakStats(groupId);
  }
}
