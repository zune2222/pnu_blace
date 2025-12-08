import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyGroup, StudyMember, JoinRequest, User } from '@pnu-blace/db';
import {
  StudyMemberDetail,
  JoinRequestInfo,
  ProcessJoinRequestDto,
  StudyMemberRole,
} from '@pnu-blace/types';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    @InjectRepository(StudyGroup)
    private studyGroupRepository: Repository<StudyGroup>,
    @InjectRepository(StudyMember)
    private studyMemberRepository: Repository<StudyMember>,
    @InjectRepository(JoinRequest)
    private joinRequestRepository: Repository<JoinRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ==================== 멤버 관리 ====================

  /**
   * 멤버 목록 조회 (상세)
   */
  async getMemberList(
    groupId: string,
    requesterId: string,
  ): Promise<StudyMemberDetail[]> {
    // 권한 확인 (멤버만)
    const requester = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: requesterId },
    });

    if (!requester) {
      throw new ForbiddenException('스터디 멤버만 접근할 수 있습니다.');
    }

    const members = await this.studyMemberRepository.find({
      where: { groupId },
      order: { role: 'ASC', joinedAt: 'ASC' },
    });

    return members.map((member) => ({
      memberId: member.memberId,
      studentId: member.studentId,
      displayName: member.displayName,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      lastActiveAt: member.lastActiveAt?.toISOString(),
    }));
  }

  /**
   * 멤버 역할 변경
   */
  async updateMemberRole(
    groupId: string,
    targetMemberId: string,
    newRole: StudyMemberRole,
    requesterId: string,
  ): Promise<void> {
    // 요청자 권한 확인
    const requester = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: requesterId },
    });

    if (!requester || requester.role !== 'OWNER') {
      throw new ForbiddenException('스터디장만 역할을 변경할 수 있습니다.');
    }

    // 대상 멤버 확인
    const targetMember = await this.studyMemberRepository.findOne({
      where: { memberId: targetMemberId, groupId },
    });

    if (!targetMember) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    // 자기 자신의 역할은 변경 불가
    if (targetMember.studentId === requesterId) {
      throw new BadRequestException('자신의 역할은 변경할 수 없습니다.');
    }

    // OWNER로 변경하는 것은 위임 API를 사용해야 함
    if (newRole === 'OWNER') {
      throw new BadRequestException(
        '스터디장 위임은 별도의 API를 사용해주세요.',
      );
    }

    await this.studyMemberRepository.update(
      { memberId: targetMemberId },
      { role: newRole },
    );

    this.logger.log(
      `Member role updated: ${targetMemberId} to ${newRole} by ${requesterId}`,
    );
  }

  /**
   * 멤버 강퇴
   */
  async kickMember(
    groupId: string,
    targetMemberId: string,
    requesterId: string,
  ): Promise<void> {
    // 요청자 권한 확인 (OWNER만)
    const requester = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: requesterId },
    });

    if (!requester || requester.role !== 'OWNER') {
      throw new ForbiddenException('스터디장만 멤버를 내보낼 수 있습니다.');
    }

    // 대상 멤버 확인
    const targetMember = await this.studyMemberRepository.findOne({
      where: { memberId: targetMemberId, groupId },
    });

    if (!targetMember) {
      throw new NotFoundException('멤버를 찾을 수 없습니다.');
    }

    // 자기 자신은 강퇴 불가
    if (targetMember.studentId === requesterId) {
      throw new BadRequestException('자신을 내보낼 수 없습니다.');
    }

    // OWNER는 강퇴 불가
    if (targetMember.role === 'OWNER') {
      throw new BadRequestException('스터디장은 내보낼 수 없습니다.');
    }

    await this.studyMemberRepository.delete({ memberId: targetMemberId });

    // 멤버 수 감소
    await this.studyGroupRepository.decrement({ groupId }, 'memberCount', 1);

    this.logger.log(`Member kicked: ${targetMemberId} by ${requesterId}`);
  }

  /**
   * 스터디장 위임
   */
  async transferOwnership(
    groupId: string,
    newOwnerId: string,
    requesterId: string,
  ): Promise<void> {
    // 현재 OWNER 확인
    const currentOwner = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: requesterId },
    });

    if (!currentOwner || currentOwner.role !== 'OWNER') {
      throw new ForbiddenException('스터디장만 위임할 수 있습니다.');
    }

    // 새 OWNER 확인
    const newOwner = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: newOwnerId },
    });

    if (!newOwner) {
      throw new NotFoundException('해당 멤버를 찾을 수 없습니다.');
    }

    // 자기 자신에게 위임 불가
    if (newOwnerId === requesterId) {
      throw new BadRequestException('자신에게 위임할 수 없습니다.');
    }

    // 트랜잭션으로 역할 변경
    await this.studyMemberRepository.update(
      { memberId: currentOwner.memberId },
      { role: 'ADMIN' },
    );

    await this.studyMemberRepository.update(
      { memberId: newOwner.memberId },
      { role: 'OWNER' },
    );

    // 그룹의 createdBy도 업데이트
    await this.studyGroupRepository.update(
      { groupId },
      { createdBy: newOwnerId },
    );

    this.logger.log(
      `Ownership transferred: ${requesterId} -> ${newOwnerId} for group ${groupId}`,
    );
  }

  // ==================== 참가 신청 관리 ====================

  /**
   * 참가 신청 목록 조회
   */
  async getJoinRequests(
    groupId: string,
    requesterId: string,
  ): Promise<JoinRequestInfo[]> {
    // 권한 확인 (OWNER 또는 ADMIN)
    const requester = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: requesterId },
    });

    if (
      !requester ||
      (requester.role !== 'OWNER' && requester.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        '스터디장 또는 부스터디장만 접근할 수 있습니다.',
      );
    }

    const requests = await this.joinRequestRepository.find({
      where: { groupId, status: 'PENDING' },
      order: { createdAt: 'ASC' },
    });

    // 사용자 정보 조회
    const userIds = requests.map((r) => r.studentId);
    const users = await this.userRepository.find({
      where: userIds.map((id) => ({ studentId: id })),
    });
    const userMap = new Map(users.map((u) => [u.studentId, u]));

    return requests.map((request) => {
      const user = userMap.get(request.studentId);
      return {
        requestId: request.requestId,
        studentId: request.studentId,
        studentName: user?.name || '알 수 없음',
        displayName: request.displayName || user?.name || '멤버',
        message: request.message,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        processedAt: request.processedAt?.toISOString(),
        rejectionReason: request.rejectionReason,
      };
    });
  }

  /**
   * 참가 신청 처리 (승인/거절)
   */
  async processJoinRequest(
    groupId: string,
    requestId: string,
    dto: ProcessJoinRequestDto,
    requesterId: string,
  ): Promise<void> {
    // 권한 확인 (OWNER 또는 ADMIN)
    const requester = await this.studyMemberRepository.findOne({
      where: { groupId, studentId: requesterId },
    });

    if (
      !requester ||
      (requester.role !== 'OWNER' && requester.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        '스터디장 또는 부스터디장만 처리할 수 있습니다.',
      );
    }

    // 신청 확인
    const request = await this.joinRequestRepository.findOne({
      where: { requestId, groupId, status: 'PENDING' },
    });

    if (!request) {
      throw new NotFoundException('참가 신청을 찾을 수 없습니다.');
    }

    // 그룹 확인
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    if (dto.status === 'APPROVED') {
      // 최대 인원 확인
      if (group.maxMembers && group.memberCount >= group.maxMembers) {
        throw new BadRequestException('스터디 최대 인원에 도달했습니다.');
      }

      // 사용자 정보 조회
      const user = await this.userRepository.findOne({
        where: { studentId: request.studentId },
      });

      // 멤버 추가
      const member = this.studyMemberRepository.create({
        groupId,
        studentId: request.studentId,
        role: 'MEMBER',
        displayName:
          request.displayName ||
          dto.displayName || // 기존 호환성
          user?.name ||
          '멤버',
      });

      await this.studyMemberRepository.save(member);

      // 멤버 수 증가
      await this.studyGroupRepository.increment({ groupId }, 'memberCount', 1);
    }

    // 신청 상태 업데이트
    await this.joinRequestRepository.update(
      { requestId },
      {
        status: dto.status,
        processedBy: requesterId,
        processedAt: new Date(),
        rejectionReason:
          dto.status === 'REJECTED' ? dto.rejectionReason : undefined,
      },
    );

    this.logger.log(
      `Join request ${requestId} ${dto.status} by ${requesterId}`,
    );
  }
}
