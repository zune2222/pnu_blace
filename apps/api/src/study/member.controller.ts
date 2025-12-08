import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  StudyMemberDetail,
  JoinRequestInfo,
  ProcessJoinRequestDto,
  UpdateMemberRoleDto,
  StudyActionResponse,
} from '@pnu-blace/types';

@Controller('api/v1/study-groups/:groupId')
@UseGuards(JwtAuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // ==================== 멤버 관리 ====================

  /**
   * 멤버 목록 조회 (상세)
   */
  @Get('members')
  async getMemberList(
    @Param('groupId') groupId: string,
    @Request() req,
  ): Promise<StudyMemberDetail[]> {
    return this.memberService.getMemberList(groupId, req.user.studentId);
  }

  /**
   * 멤버 역할 변경
   */
  @Put('members/:memberId/role')
  async updateMemberRole(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req,
  ): Promise<StudyActionResponse> {
    await this.memberService.updateMemberRole(
      groupId,
      memberId,
      dto.role,
      req.user.studentId,
    );

    return {
      success: true,
      message: '멤버 역할이 변경되었습니다.',
    };
  }

  /**
   * 멤버 강퇴
   */
  @Delete('members/:memberId')
  @HttpCode(HttpStatus.OK)
  async kickMember(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ): Promise<StudyActionResponse> {
    await this.memberService.kickMember(groupId, memberId, req.user.studentId);

    return {
      success: true,
      message: '멤버가 내보내졌습니다.',
    };
  }

  /**
   * 스터디장 위임
   */
  @Post('transfer')
  async transferOwnership(
    @Param('groupId') groupId: string,
    @Body() body: { newOwnerId: string },
    @Request() req,
  ): Promise<StudyActionResponse> {
    await this.memberService.transferOwnership(
      groupId,
      body.newOwnerId,
      req.user.studentId,
    );

    return {
      success: true,
      message: '스터디장이 위임되었습니다.',
    };
  }

  // ==================== 참가 신청 관리 ====================

  /**
   * 참가 신청 목록 조회
   */
  @Get('requests')
  async getJoinRequests(
    @Param('groupId') groupId: string,
    @Request() req,
  ): Promise<JoinRequestInfo[]> {
    return this.memberService.getJoinRequests(groupId, req.user.studentId);
  }

  /**
   * 참가 신청 처리 (승인/거절)
   */
  @Put('requests/:requestId')
  async processJoinRequest(
    @Param('groupId') groupId: string,
    @Param('requestId') requestId: string,
    @Body() dto: ProcessJoinRequestDto,
    @Request() req,
  ): Promise<StudyActionResponse> {
    await this.memberService.processJoinRequest(
      groupId,
      requestId,
      dto,
      req.user.studentId,
    );

    return {
      success: true,
      message:
        dto.status === 'APPROVED'
          ? '참가 신청이 승인되었습니다.'
          : '참가 신청이 거절되었습니다.',
    };
  }
}
