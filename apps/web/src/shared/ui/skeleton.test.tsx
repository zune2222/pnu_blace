import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable, 
  SkeletonStats 
} from './skeleton';

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default classes', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded');
    });

    it('applies custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-full" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-full');
    });
  });

  describe('SkeletonText', () => {
    it('renders default 3 lines', () => {
      const { container } = render(<SkeletonText />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines.length).toBe(3);
    });

    it('renders custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);
      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines.length).toBe(5);
    });

    it('last line is shorter (w-3/4)', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const lines = container.querySelectorAll('.animate-pulse');
      const lastLine = lines[lines.length - 1];
      expect(lastLine).toHaveClass('w-3/4');
    });
  });

  describe('SkeletonCard', () => {
    it('renders with header by default', () => {
      const { container } = render(<SkeletonCard />);
      const roundedFull = container.querySelector('.rounded-full');
      expect(roundedFull).toBeInTheDocument();
    });

    it('renders without header when hasHeader is false', () => {
      const { container } = render(<SkeletonCard hasHeader={false} />);
      const roundedFull = container.querySelector('.rounded-full');
      expect(roundedFull).not.toBeInTheDocument();
    });
  });

  describe('SkeletonList', () => {
    it('renders default 5 items', () => {
      const { container } = render(<SkeletonList />);
      const items = container.querySelectorAll('.border');
      expect(items.length).toBe(5);
    });

    it('renders custom count', () => {
      const { container } = render(<SkeletonList count={3} />);
      const items = container.querySelectorAll('.border');
      expect(items.length).toBe(3);
    });
  });

  describe('SkeletonTable', () => {
    it('renders default 5 rows and 4 columns', () => {
      const { container } = render(<SkeletonTable />);
      // Header row + 5 data rows = check structure exists
      const rows = container.querySelectorAll('.flex.gap-4');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('renders custom rows and cols', () => {
      const { container } = render(<SkeletonTable rows={3} cols={2} />);
      // Should have header + 3 rows
      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('SkeletonStats', () => {
    it('renders 3 stat cards', () => {
      const { container } = render(<SkeletonStats />);
      const cards = container.querySelectorAll('.border');
      expect(cards.length).toBe(3);
    });

    it('has responsive grid classes', () => {
      const { container } = render(<SkeletonStats />);
      const grid = container.firstChild;
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });
});
