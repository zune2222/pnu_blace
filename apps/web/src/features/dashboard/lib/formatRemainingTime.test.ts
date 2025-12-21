import { describe, it, expect } from 'vitest';
import { formatRemainingTime } from './formatRemainingTime';

describe('formatRemainingTime', () => {
  describe('basic formatting', () => {
    it('formats 0 minutes correctly', () => {
      expect(formatRemainingTime(0)).toBe('0:00:00');
    });

    it('formats minutes less than an hour', () => {
      expect(formatRemainingTime(30)).toBe('0:30:00');
    });

    it('formats exactly 1 hour', () => {
      expect(formatRemainingTime(60)).toBe('1:00:00');
    });

    it('formats 1 hour 30 minutes', () => {
      expect(formatRemainingTime(90)).toBe('1:30:00');
    });

    it('formats 2 hours 15 minutes', () => {
      expect(formatRemainingTime(135)).toBe('2:15:00');
    });
  });

  describe('with seconds', () => {
    it('formats with seconds', () => {
      expect(formatRemainingTime(30, 45)).toBe('0:30:45');
    });

    it('formats single digit seconds with padding', () => {
      expect(formatRemainingTime(30, 5)).toBe('0:30:05');
    });

    it('formats 0 seconds correctly', () => {
      expect(formatRemainingTime(60, 0)).toBe('1:00:00');
    });

    it('formats 59 seconds correctly', () => {
      expect(formatRemainingTime(59, 59)).toBe('0:59:59');
    });
  });

  describe('edge cases', () => {
    it('handles single digit minutes with padding', () => {
      expect(formatRemainingTime(5)).toBe('0:05:00');
    });

    it('handles large hour values', () => {
      expect(formatRemainingTime(180)).toBe('3:00:00');
    });

    it('handles 4 hours 59 minutes 59 seconds', () => {
      expect(formatRemainingTime(299, 59)).toBe('4:59:59');
    });
  });
});
