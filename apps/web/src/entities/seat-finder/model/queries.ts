export const seatFinderKeys = {
  all: ['seatFinder'] as const,
  detail: (roomNo: string) => [...seatFinderKeys.all, 'detail', roomNo] as const,
  prediction: (roomNo: string, seatNo: string) => [...seatFinderKeys.all, 'prediction', roomNo, seatNo] as const,
} as const;
