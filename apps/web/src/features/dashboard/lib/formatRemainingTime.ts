export const formatRemainingTime = (minutes: number, seconds: number = 0): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};