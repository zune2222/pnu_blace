// React Query 키 팩토리
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  currentSeat: () => [...dashboardKeys.all, 'currentSeat'] as const,
  favoriteRooms: () => [...dashboardKeys.all, 'favoriteRooms'] as const,
  insights: () => [...dashboardKeys.all, 'insights'] as const,
  seatHistory: () => [...dashboardKeys.all, 'seatHistory'] as const,
  streakHeatmap: () => [...dashboardKeys.all, 'streakHeatmap'] as const,
  myRank: () => [...dashboardKeys.all, 'myRank'] as const,
  myStats: () => [...dashboardKeys.all, 'myStats'] as const,
  seatHistoryTable: (page: number, startDate?: string, endDate?: string) => 
    [...dashboardKeys.all, 'seatHistoryTable', { page, startDate, endDate }] as const,
} as const;