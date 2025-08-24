import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AcademicCalendar } from '@pnu-blace/db';

export type PeriodType = 'NORMAL' | 'EXAM' | 'VACATION' | 'FINALS';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(AcademicCalendar)
    private calendarRepository: Repository<AcademicCalendar>,
  ) {}

  /**
   * 현재 날짜의 학사일정 기간 타입 조회
   */
  async getCurrentPeriodType(date: Date = new Date()): Promise<PeriodType> {
    try {
      const currentDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );

      const currentPeriod = await this.calendarRepository.findOne({
        where: {
          startDate: Between(
            new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000),
            currentDate,
          ) as any,
          endDate: Between(
            currentDate,
            new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000),
          ) as any,
          isActive: true,
        },
        order: {
          startDate: 'DESC',
        },
      });

      if (currentPeriod) {
        this.logger.debug(
          `Current period: ${currentPeriod.name} (${currentPeriod.type})`,
        );
        return currentPeriod.type;
      }

      // 기본값은 NORMAL
      this.logger.debug('No specific period found, defaulting to NORMAL');
      return 'NORMAL';
    } catch (error: any) {
      this.logger.error(`Failed to get current period: ${error.message}`);
      return 'NORMAL';
    }
  }

  /**
   * 학사일정 등록
   */
  async createCalendarEvent(
    name: string,
    startDate: Date,
    endDate: Date,
    type: PeriodType,
    description?: string,
  ): Promise<AcademicCalendar> {
    const calendar = this.calendarRepository.create({
      name,
      startDate,
      endDate,
      type,
      description,
      isActive: true,
    });

    return this.calendarRepository.save(calendar);
  }

  /**
   * 활성 학사일정 목록 조회
   */
  async getActiveCalendarEvents(): Promise<AcademicCalendar[]> {
    return this.calendarRepository.find({
      where: { isActive: true },
      order: { startDate: 'ASC' },
    });
  }

  /**
   * 특정 기간의 학사일정 기간 타입 조회
   */
  async getPeriodTypeForDate(date: Date): Promise<PeriodType> {
    return this.getCurrentPeriodType(date);
  }
}
