import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
  StudyGroup,
  StudyMember,
  JoinRequest,
  AttendanceRecord,
  VacationRequest,
  User,
} from '@pnu-blace/db';
import {
  CreateStudyGroupDto,
  UpdateStudyGroupDto,
  StudyGroupListItem,
  StudyGroupDetail,
  StudyMemberPublic,
  StudyMemberDetail,
  TodayAttendancePublic,
  JoinRequestInfo,
  StudyGroupListResponse,
  MyStudyGroupItem,
  MyStudyGroupListResponse,
  AttendanceStats,
} from '@pnu-blace/types';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class StudyService {
  private readonly logger = new Logger(StudyService.name);

  constructor(
    @InjectRepository(StudyGroup)
    private studyGroupRepository: Repository<StudyGroup>,
    @InjectRepository(StudyMember)
    private studyMemberRepository: Repository<StudyMember>,
    @InjectRepository(JoinRequest)
    private joinRequestRepository: Repository<JoinRequest>,
    @InjectRepository(AttendanceRecord)
    private attendanceRecordRepository: Repository<AttendanceRecord>,
    @InjectRepository(VacationRequest)
    private vacationRequestRepository: Repository<VacationRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ==================== 공개 API (비로그인) ====================

  /**
   * 공개 스터디 목록 조회
   */
  async getPublicStudyGroups(
    page: number = 1,
    limit: number = 20,
    search?: string,
    tags?: string[],
  ): Promise<StudyGroupListResponse> {
    const query = this.studyGroupRepository
      .createQueryBuilder('group')
      .where('group.visibility != :visibility', { visibility: 'PRIVATE' })
      .orderBy('group.createdAt', 'DESC');

    if (search) {
      query.andWhere(
        '(group.name ILIKE :search OR group.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tags && tags.length > 0) {
      // PostgreSQL의 array 연산자 사용
      query.andWhere('group.tags && :tags', { tags });
    }

    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const studyGroupItems: StudyGroupListItem[] = items.map((group) =>
      this.toStudyGroupListItem(group),
    );

    return {
      items: studyGroupItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 스터디 상세 정보 조회 (공개)
   */
  async getStudyGroupDetail(groupId: string): Promise<StudyGroupDetail> {
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    // 멤버 목록 조회
    const members = await this.studyMemberRepository.find({
      where: { groupId },
      order: { role: 'ASC', joinedAt: 'ASC' },
    });

    const memberPublicList: StudyMemberPublic[] = members.map((member) => ({
      memberId: member.memberId,
      displayName: member.displayName,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    }));

    return {
      groupId: group.groupId,
      name: group.name,
      description: group.description,
      visibility: group.visibility,
      tags: group.tags,
      maxMembers: group.maxMembers,
      memberCount: group.memberCount,
      checkInStartTime: group.checkInStartTime,
      checkInEndTime: group.checkInEndTime,
      checkOutMinTime: group.checkOutMinTime,
      minUsageMinutes: group.minUsageMinutes,
      operatingDays: group.operatingDays.map((d) => parseInt(d)),
      thumbnailUrl: group.thumbnailUrl,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      members: memberPublicList,
    };
  }

  /**
   * 오늘의 출퇴근 현황 조회 (공개)
   */
  async getTodayAttendance(groupId: string): Promise<TodayAttendancePublic[]> {
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 멤버 목록
    const members = await this.studyMemberRepository.find({
      where: { groupId },
    });

    // 오늘의 출퇴근 기록
    const attendanceRecords = await this.attendanceRecordRepository.find({
      where: {
        groupId,
        date: today,
      },
    });

    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.studentId, record]),
    );

    return members.map((member) => {
      const record = attendanceMap.get(member.studentId);

      if (record) {
        return {
          memberId: member.memberId,
          displayName: member.displayName,
          status: record.status,
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          usageMinutes: record.usageMinutes,
          isCurrentlyIn: !!record.checkInTime && !record.checkOutTime,
        };
      }

      return {
        memberId: member.memberId,
        displayName: member.displayName,
        status: 'NOT_YET' as const,
        isCurrentlyIn: false,
      };
    });
  }

  /**
   * 스터디 검색
   */
  async searchStudyGroups(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<StudyGroupListResponse> {
    return this.getPublicStudyGroups(page, limit, query);
  }

  /**
   * 인기 태그 목록
   */
  async getPopularTags(): Promise<{ tag: string; count: number }[]> {
    const groups = await this.studyGroupRepository.find({
      where: { visibility: Not('PRIVATE') },
      select: ['tags'],
    });

    const tagCount = new Map<string, number>();
    groups.forEach((group) => {
      group.tags?.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCount.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  // ==================== 스터디 CRUD (로그인 필요) ====================

  /**
   * 스터디 생성
   */
  async createStudyGroup(
    studentId: string,
    dto: CreateStudyGroupDto,
  ): Promise<StudyGroupDetail> {
    // 사용자 확인
    const user = await this.userRepository.findOne({ where: { studentId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 비밀번호 타입인데 비밀번호가 없는 경우
    if (dto.visibility === 'PASSWORD' && !dto.password) {
      throw new BadRequestException('비밀번호 스터디는 비밀번호가 필요합니다.');
    }

    // 초대 코드 생성
    const inviteCode = this.generateInviteCode();

    // 비밀번호 해시
    let hashedPassword: string | undefined;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    // 스터디 그룹 생성
    const studyGroup = this.studyGroupRepository.create({
      name: dto.name,
      description: dto.description,
      visibility: dto.visibility,
      password: hashedPassword,
      inviteCode,
      tags: dto.tags,
      maxMembers: dto.maxMembers,
      checkInStartTime: dto.checkInStartTime,
      checkInEndTime: dto.checkInEndTime,
      checkOutMinTime: dto.checkOutMinTime,
      minUsageMinutes: dto.minUsageMinutes,
      operatingDays: dto.operatingDays.map((d) => d.toString()),
      createdBy: studentId,
      memberCount: 1,
    });

    const savedGroup = await this.studyGroupRepository.save(studyGroup);

    // 스터디장으로 멤버 추가
    const member = this.studyMemberRepository.create({
      groupId: savedGroup.groupId,
      studentId,
      role: 'OWNER',
      displayName: dto.displayName || user.name,
    });

    await this.studyMemberRepository.save(member);

    return this.getStudyGroupDetail(savedGroup.groupId);
  }

  /**
   * 스터디 수정
   */
  async updateStudyGroup(
    groupId: string,
    studentId: string,
    dto: UpdateStudyGroupDto,
  ): Promise<StudyGroupDetail> {
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    // 권한 확인 (OWNER 또는 ADMIN)
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new ForbiddenException('스터디 수정 권한이 없습니다.');
    }

    // 비밀번호 변경 시 해시
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // operatingDays 변환
    const updateData: any = { ...dto };
    if (dto.operatingDays) {
      updateData.operatingDays = dto.operatingDays.map((d) => d.toString());
    }

    await this.studyGroupRepository.update({ groupId }, updateData);

    return this.getStudyGroupDetail(groupId);
  }

  /**
   * 스터디 삭제
   */
  async deleteStudyGroup(groupId: string, studentId: string): Promise<void> {
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    // OWNER만 삭제 가능
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (!member || member.role !== 'OWNER') {
      throw new ForbiddenException('스터디 삭제 권한이 없습니다.');
    }

    await this.studyGroupRepository.delete({ groupId });
  }

  /**
   * 내 스터디 목록 조회
   */
  async getMyStudyGroups(studentId: string): Promise<MyStudyGroupListResponse> {
    const memberships = await this.studyMemberRepository.find({
      where: { studentId },
      relations: ['studyGroup'],
    });

    const items: MyStudyGroupItem[] = await Promise.all(
      memberships.map(async (membership) => {
        const group = membership.studyGroup;
        const baseItem = this.toStudyGroupListItem(group);

        // 내 출석 통계 계산
        const myAttendanceStats = await this.calculateMemberAttendanceStats(
          group.groupId,
          studentId,
        );

        return {
          ...baseItem,
          myRole: membership.role,
          myDisplayName: membership.displayName,
          myAttendanceStats,
        };
      }),
    );

    return { items };
  }

  // ==================== 가입 관련 ====================

  /**
   * 참가 신청 (공개 스터디)
   */
  async requestJoin(
    groupId: string,
    studentId: string,
    displayName: string,
    message?: string,
  ): Promise<JoinRequestInfo> {
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    if (group.visibility !== 'PUBLIC') {
      throw new BadRequestException('공개 스터디만 참가 신청이 가능합니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (existingMember) {
      throw new ConflictException('이미 스터디 멤버입니다.');
    }

    // 이미 신청했는지 확인
    const existingRequest = await this.joinRequestRepository.findOne({
      where: { groupId, studentId, status: 'PENDING' },
    });

    if (existingRequest) {
      throw new ConflictException('이미 참가 신청 중입니다.');
    }

    // 최대 인원 확인
    if (group.maxMembers && group.memberCount >= group.maxMembers) {
      throw new BadRequestException('스터디 최대 인원에 도달했습니다.');
    }

    const user = await this.userRepository.findOne({ where: { studentId } });

    const request = this.joinRequestRepository.create({
      groupId,
      studentId,
      displayName,
      message,
      status: 'PENDING',
    });

    const savedRequest = await this.joinRequestRepository.save(request);

    return {
      requestId: savedRequest.requestId,
      studentId: savedRequest.studentId,
      studentName: user?.name || '알 수 없음',
      displayName: savedRequest.displayName || user?.name || '멤버',
      message: savedRequest.message,
      status: savedRequest.status,
      createdAt: savedRequest.createdAt.toISOString(),
    };
  }

  /**
   * 비밀번호로 가입
   */
  async joinWithPassword(
    groupId: string,
    studentId: string,
    password: string,
    displayName: string,
  ): Promise<void> {
    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    if (group.visibility !== 'PASSWORD') {
      throw new BadRequestException('비밀번호 스터디가 아닙니다.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, group.password!);
    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (existingMember) {
      throw new ConflictException('이미 스터디 멤버입니다.');
    }

    // 최대 인원 확인
    if (group.maxMembers && group.memberCount >= group.maxMembers) {
      throw new BadRequestException('스터디 최대 인원에 도달했습니다.');
    }

    // 멤버 추가
    await this.addMember(groupId, studentId, displayName);
  }

  /**
   * 초대 코드로 가입
   */
  async joinWithInviteCode(
    inviteCode: string,
    studentId: string,
    displayName: string,
  ): Promise<StudyGroupDetail> {
    const group = await this.studyGroupRepository.findOne({
      where: { inviteCode },
    });

    if (!group) {
      throw new NotFoundException('유효하지 않은 초대 코드입니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.studyMemberRepository.findOne({
      where: { groupId: group.groupId, studentId },
    });

    if (existingMember) {
      throw new ConflictException('이미 스터디 멤버입니다.');
    }

    // 최대 인원 확인
    if (group.maxMembers && group.memberCount >= group.maxMembers) {
      throw new BadRequestException('스터디 최대 인원에 도달했습니다.');
    }

    // 멤버 추가
    await this.addMember(group.groupId, studentId, displayName);

    return this.getStudyGroupDetail(group.groupId);
  }

  /**
   * 스터디 탈퇴
   */
  async leaveStudyGroup(groupId: string, studentId: string): Promise<void> {
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (!member) {
      throw new NotFoundException('스터디 멤버가 아닙니다.');
    }

    // OWNER는 탈퇴 불가 (위임 후 탈퇴해야 함)
    if (member.role === 'OWNER') {
      throw new BadRequestException(
        '스터디장은 탈퇴할 수 없습니다. 스터디장을 위임하거나 스터디를 삭제해주세요.',
      );
    }

    await this.studyMemberRepository.delete({ memberId: member.memberId });

    // 멤버 수 감소
    await this.studyGroupRepository.decrement({ groupId }, 'memberCount', 1);
  }

  // ==================== Helper Methods ====================

  private generateInviteCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  private async addMember(
    groupId: string,
    studentId: string,
    displayName: string,
  ): Promise<StudyMember> {
    const member = this.studyMemberRepository.create({
      groupId,
      studentId,
      role: 'MEMBER',
      displayName,
    });

    await this.studyMemberRepository.save(member);

    // 멤버 수 증가
    await this.studyGroupRepository.increment({ groupId }, 'memberCount', 1);

    return member;
  }

  private toStudyGroupListItem(group: StudyGroup): StudyGroupListItem {
    return {
      groupId: group.groupId,
      name: group.name,
      description: group.description,
      visibility: group.visibility,
      tags: group.tags,
      maxMembers: group.maxMembers,
      memberCount: group.memberCount,
      checkInStartTime: group.checkInStartTime,
      checkInEndTime: group.checkInEndTime,
      checkOutMinTime: group.checkOutMinTime,
      thumbnailUrl: group.thumbnailUrl,
      createdAt: group.createdAt.toISOString(),
    };
  }

  private async calculateMemberAttendanceStats(
    groupId: string,
    studentId: string,
  ): Promise<AttendanceStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await this.attendanceRecordRepository.find({
      where: {
        groupId,
        studentId,
        date: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const presentDays = records.filter((r) => r.status === 'PRESENT').length;
    const lateDays = records.filter((r) => r.status === 'LATE').length;
    const earlyLeaveDays = records.filter(
      (r) => r.status === 'EARLY_LEAVE',
    ).length;
    const absentDays = records.filter((r) => r.status === 'ABSENT').length;
    const vacationDays = records.filter((r) => r.status === 'VACATION').length;

    const totalOperatingDays = records.length;
    const totalUsageMinutes = records.reduce(
      (sum, r) => sum + r.usageMinutes,
      0,
    );

    return {
      totalOperatingDays,
      presentDays,
      lateDays,
      earlyLeaveDays,
      absentDays,
      vacationDays,
      attendanceRate:
        totalOperatingDays > 0
          ? Math.round(((presentDays + lateDays) / totalOperatingDays) * 100)
          : 0,
      totalUsageMinutes,
      averageUsageMinutes:
        totalOperatingDays > 0
          ? Math.round(totalUsageMinutes / totalOperatingDays)
          : 0,
    };
  }

  /**
   * 스터디 초대 코드 조회 (멤버만)
   */
  async getInviteCode(groupId: string, studentId: string): Promise<string> {
    const member = await this.studyMemberRepository.findOne({
      where: { groupId, studentId },
    });

    if (!member) {
      throw new ForbiddenException('스터디 멤버만 초대 코드를 볼 수 있습니다.');
    }

    const group = await this.studyGroupRepository.findOne({
      where: { groupId },
    });

    if (!group) {
      throw new NotFoundException('스터디를 찾을 수 없습니다.');
    }

    return group.inviteCode;
  }
}
