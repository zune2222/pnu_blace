import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    
    expect(cn(
      'base',
      isActive && 'active',
      isDisabled && 'disabled'
    )).toBe('base active');
  });

  it('deduplicates Tailwind classes', () => {
    // tailwind-merge should resolve conflicting classes
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('handles array of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles empty string', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });

  it('resolves Tailwind color conflicts', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('preserves different utility classes', () => {
    expect(cn('bg-red-500', 'text-white', 'p-4')).toBe('bg-red-500 text-white p-4');
  });

  it('handles responsive modifiers', () => {
    expect(cn('md:p-4', 'md:p-8')).toBe('md:p-8');
  });

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });
});
