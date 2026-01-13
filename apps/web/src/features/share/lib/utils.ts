/**
 * 안전하게 숫자로 변환
 * NaN이나 undefined인 경우 0 반환
 */
export function safeNumber(val: unknown): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  return 0;
}
