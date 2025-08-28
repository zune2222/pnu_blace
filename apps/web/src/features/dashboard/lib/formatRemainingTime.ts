export const formatRemainingTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = 0; // API에서 초 단위는 제공되지 않으므로 0으로 설정
  return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};