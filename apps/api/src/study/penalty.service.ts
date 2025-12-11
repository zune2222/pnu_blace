import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PenaltyRecord,
  StudyMember,
  StudyGroup,
  AttendanceRecord,
} from '@pnu-blace/db';
import { AttendanceStatus, PenaltyType } from '@pnu-blace/types';

// 벌점 규칙
const PENALTY_POINTS: Record<string, number> = {
  LATE: 1,
  ABSENT: 2,
  EARLY_LEAVE: 1,
};

const PENALTY_WARNING_THRESHOLD = 10;

@Injectable()
export class PenaltyService {
  private readonly logger = new Logger(PenaltyService.name);

  constructor(
    @InjectRepository(PenaltyRecord)
    private penaltyRecordRepository: Repository<PenaltyRecord>,
    @InjectRepository(StudyMember)
    private studyMemberRepository: Repository<StudyMember>,
    @InjectRepository(StudyGroup)
    private studyGroupRepository: Repository<StudyGroup>,
  ) {}

  /**
   * 출석 상태에 따른 벌점 자동 부여
   */
  async applyPenaltyForAttendance(
    groupId: string,
    studentId: string,
    status: AttendanceStatus,
    date: Date,
    attendanceRecordId?: string,
  ): Promise<void> {
    // 벌점 적용 대상 상태인지 확인
    const penaltyType = this.getPenaltyTypeFromStatus(status);
    if (!penaltyType) {
      return; // PRESENT, VACATION은 벌점 없음
    }

    const points = PENALTY_POINTS[penaltyType];

    try {
      // 중복 체크 (같은 날 같은 출석 기록에 이미 벌점이 있는지)
      const existingPenalty = await this.penaltyRecordRepository.findOne({
        where: {
          groupId,
          studentId,
          date,
          attendanceRecordId,
          isRevoked: false,
        },
      });

      if (existingPenalty) {
        this.logger.debug(`Penalty already exists for ${studentId} on ${date.toISOString()}`);
        return;
      }

      // 벌점 기록 생성
      const penaltyRecord = this.penaltyRecordRepository.create({
        groupId,
        studentId,
        type: penaltyType as any,
        points,
        date,
        attendanceRecordId,
      });

      await this.penaltyRecordRepository.save(penaltyRecord);

      // 멤버 벌점 업데이트
      await this.updateMemberPenaltyPoints(groupId, studentId, points);

      this.logger.debug(
        `Applied ${points} penalty points to ${studentId} for ${penaltyType}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to apply penalty: ${error.message}`);
    }
  }

  /**
   * 출석 상태를 벌점 타입으로 변환
   */
  private getPenaltyTypeFromStatus(status: AttendanceStatus): PenaltyType | null {
    switch (status) {
      case 'LATE':
        return 'LATE';
      case 'ABSENT':
        return 'ABSENT';
      case 'EARLY_LEAVE':
        return 'EARLY_LEAVE';
      default:
        return null;
    }
  }

  /**
   * 멤버 벌점 업데이트
   */
  private async updateMemberPenaltyPoints(
    groupId: string,
    studentId: string,
    additionalPoints: number,
  ): Promise<void> {
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (!member) return;

    member.currentPenaltyPoints += additionalPoints;
    member.totalPenaltyPoints += additionalPoints;

    await this.studyMemberRepository.save(member);

    // 경고 임계값 체크
    if (member.currentPenaltyPoints >= PENALTY_WARNING_THRESHOLD) {
      this.logger.warn(
        `Member ${studentId} in group ${groupId} reached penalty threshold: ${member.currentPenaltyPoints} points`,
      );
      // TODO: 스터디장에게 알림 전송
    }
  }

  /**
   * 그룹별 멤버 벌점 현황 조회
   */
  async getGroupPenaltyStats(groupId: string): Promise<Array<{
    memberId: string;
    studentId: string;
    displayName: string;
    currentPenaltyPoints: number;
    totalPenaltyPoints: number;
  }>> {
    const members = await this.studyMemberRepository.find({
      where: { groupId },
    });

    return members.map((member) => ({
      memberId: member.memberId,
      studentId: member.studentId,
      displayName: member.displayName,
      currentPenaltyPoints: member.currentPenaltyPoints,
      totalPenaltyPoints: member.totalPenaltyPoints,
    }));
  }

  /**
   * 특정 멤버의 벌점 이력 조회
   */
  async getMemberPenaltyHistory(
    groupId: string,
    studentId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    records: PenaltyRecord[];
    total: number;
    currentPoints: number;
    totalPoints: number;
  }> {
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    const [records, total] = await this.penaltyRecordRepository.findAndCount({
      where: { groupId, studentId, isRevoked: false },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      records,
      total,
      currentPoints: member?.currentPenaltyPoints || 0,
      totalPoints: member?.totalPenaltyPoints || 0,
    };
  }

  /**
   * 매월 1일 00:00에 벌점 리셋
   */
  @Cron('0 0 1 * *')
  async resetMonthlyPenalties(): Promise<void> {
    this.logger.log('Starting monthly penalty reset...');

    try {
      await this.studyMemberRepository.update(
        {},
        {
          currentPenaltyPoints: 0,
          lastPenaltyResetAt: new Date(),
        },
      );

      this.logger.log('Monthly penalty reset completed');
    } catch (error: any) {
      this.logger.error(`Monthly penalty reset failed: ${error.message}`);
    }
  }

  /**
   * 벌점 수동 취소
   */
  async revokePenalty(penaltyId: string): Promise<void> {
    const penalty = await this.penaltyRecordRepository.findOne({
      where: { penaltyId },
    });

    if (!penalty || penalty.isRevoked) return;

    penalty.isRevoked = true;
    await this.penaltyRecordRepository.save(penalty);

    // 멤버 벌점 차감
    const member = await this.studyMemberRepository.findOne({
      where: { groupId: penalty.groupId, studentId: penalty.studentId },
    });

    if (member) {
      member.currentPenaltyPoints = Math.max(0, member.currentPenaltyPoints - penalty.points);
      await this.studyMemberRepository.save(member);
    }

    this.logger.debug(`Penalty ${penaltyId} revoked`);
  }
}
