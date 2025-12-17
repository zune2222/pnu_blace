// Ranking User Types
export interface RankingUser {
  rank: number;
  publicNickname: string;
  totalHours: number;
  totalSessions: number;
  totalDays: number;
  tier: string;
}

export interface WeeklyRankingUser {
  rank: number;
  publicNickname: string;
  weeklyHours: number;
  weeklySessions: number;
  weeklyDays: number;
  tier: string;
}

// Pagination Info
export interface RankingPaginationInfo {
  page: number;
  limit: number;
  totalPages: {
    hours: number;
    sessions: number;
    days: number;
  };
  totalItems: {
    hours: number;
    sessions: number;
    days: number;
  };
}

// All-Time Rankings Data
export interface AllTimeRankingsData {
  hoursRanking: RankingUser[];
  sessionsRanking: RankingUser[];
  daysRanking: RankingUser[];
  pagination: RankingPaginationInfo;
}

// Weekly Rankings Data
export interface WeeklyRankingsData {
  weekStart: string;
  weekEnd: string;
  hoursRanking: WeeklyRankingUser[];
  sessionsRanking: WeeklyRankingUser[];
  daysRanking: WeeklyRankingUser[];
  pagination: RankingPaginationInfo;
}

// My Rank Info
export interface MyRankInfo {
  totalUsers: number;
  hoursRank?: number;
  sessionsRank?: number;
  daysRank?: number;
  hoursPercentile?: number;
  sessionsPercentile?: number;
  daysPercentile?: number;
  tier: string;
  publicNickname?: string;
}

// Privacy Settings
export interface RankingPrivacySettings {
  isPublicRanking: boolean;
  publicNickname?: string;
}

export type RankingType = "hours" | "sessions" | "days";
