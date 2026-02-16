import { DataSource } from 'typeorm';
import { AcademicCalendar } from '@pnu-blace/db';

/**
 * 2025년 2학기 학사일정 시드 데이터
 * run-seeds.ts를 통해 실행하거나 DataSource를 직접 전달
 */

interface CalendarSeed {
  name: string;
  startDate: string;
  endDate: string;
  type: 'NORMAL' | 'EXAM' | 'VACATION' | 'FINALS';
  description: string;
}

const ACADEMIC_EVENTS: CalendarSeed[] = [
  {
    name: '2025-2학기 중간고사',
    startDate: '2025-10-10',
    endDate: '2025-10-18',
    type: 'EXAM',
    description: '2025년 2학기 중간고사 기간',
  },
  {
    name: '2025-2학기 기말고사',
    startDate: '2025-12-01',
    endDate: '2025-12-14',
    type: 'FINALS',
    description: '2025년 2학기 기말고사 기간',
  },
  {
    name: '2025 겨울방학',
    startDate: '2025-12-20',
    endDate: '2026-02-28',
    type: 'VACATION',
    description: '2025년 겨울방학 기간',
  },
];

export async function seedAcademicCalendar(
  dataSource: DataSource,
): Promise<void> {
  const repo = dataSource.getRepository(AcademicCalendar);

  for (const event of ACADEMIC_EVENTS) {
    const existing = await repo.findOne({
      where: { name: event.name },
    });

    if (existing) {
      console.log(`[skip] 이미 존재: ${event.name}`);
      continue;
    }

    await repo.save(
      repo.create({
        name: event.name,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        type: event.type,
        description: event.description,
        isActive: true,
      }),
    );
    console.log(`[seed] 등록 완료: ${event.name} (${event.type})`);
  }

  console.log('학사일정 시드 완료');
}
