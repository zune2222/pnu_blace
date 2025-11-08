import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";

@Entity()
@Index('idx_user_stats_total_hours', ['totalUsageHours'])
@Index('idx_user_stats_total_sessions', ['totalSessions'])
@Index('idx_user_stats_total_days', ['totalDays'])
export class UserStats {
  @PrimaryColumn()
  studentId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalUsageHours!: number;

  @Column({ type: 'int', default: 0 })
  totalSessions!: number;

  @Column({ type: 'int', default: 0 })
  totalDays!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageSessionHours!: number;

  @Column({ nullable: true })
  favoriteRoomName?: string;

  @Column({ type: 'int', default: 0 })
  favoriteRoomVisits!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  favoriteRoomHours!: number;

  // 이번주 통계
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  weeklyUsageHours!: number;

  @Column({ type: 'int', default: 0 })
  weeklySessions!: number;

  @Column({ type: 'int', default: 0 })
  weeklyDays!: number;

  @Column({ type: 'date', nullable: true })
  weekStartDate?: Date;

  // 랭킹 관련
  @Column({ type: 'int', nullable: true })
  hoursRank?: number;

  @Column({ type: 'int', nullable: true })
  sessionsRank?: number;

  @Column({ type: 'int', nullable: true })
  daysRank?: number;

  @Column({ type: 'int', nullable: true })
  weeklyHoursRank?: number;

  @Column({ type: 'int', nullable: true })
  weeklySessionsRank?: number;

  @Column({ type: 'int', nullable: true })
  weeklyDaysRank?: number;

  // 레벨/티어 시스템
  @Column({ type: 'varchar', length: 50, default: 'Explorer' })
  tier!: string; // Explorer, Student, Scholar, Master, Legend, Myth

  // 랭킹 공개 설정
  @Column({ type: 'boolean', default: false })
  isPublicRanking!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  publicNickname?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastDataSyncAt?: Date;
}