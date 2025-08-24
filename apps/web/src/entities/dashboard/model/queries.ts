// React Query 키 팩토리
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
  currentSeat: () => [...dashboardKeys.all, 'currentSeat'] as const,
  favoriteRooms: () => [...dashboardKeys.all, 'favoriteRooms'] as const,
  insights: () => [...dashboardKeys.all, 'insights'] as const,
} as const;