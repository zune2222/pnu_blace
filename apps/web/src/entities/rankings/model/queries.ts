export const rankingsKeys = {
  all: ['rankings'] as const,
  allTime: (page: number) => [...rankingsKeys.all, 'allTime', page] as const,
  weekly: (page: number) => [...rankingsKeys.all, 'weekly', page] as const,
  myRank: () => [...rankingsKeys.all, 'myRank'] as const,
  privacySettings: () => [...rankingsKeys.all, 'privacySettings'] as const,
} as const;
