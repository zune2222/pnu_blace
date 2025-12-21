import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  LoadingSpinner, 
  FullPageLoader, 
  InlineLoader, 
  ButtonLoader, 
  SectionLoader 
} from './loading';

describe('Loading Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default md size', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('renders with sm size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with lg size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('accepts custom className', () => {
      const { container } = render(<LoadingSpinner className="text-blue-500" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('text-blue-500');
    });
  });

  describe('FullPageLoader', () => {
    it('renders default message', () => {
      render(<FullPageLoader />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('renders custom message', () => {
      render(<FullPageLoader message="데이터를 불러오는 중입니다" />);
      expect(screen.getByText('데이터를 불러오는 중입니다')).toBeInTheDocument();
    });

    it('has fixed position for overlay', () => {
      const { container } = render(<FullPageLoader />);
      expect(container.firstChild).toHaveClass('fixed', 'inset-0');
    });

    it('renders spinner', () => {
      const { container } = render(<FullPageLoader />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('InlineLoader', () => {
    it('renders spinner', () => {
      const { container } = render(<InlineLoader />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('renders with message', () => {
      render(<InlineLoader message="잠시만 기다려주세요" />);
      expect(screen.getByText('잠시만 기다려주세요')).toBeInTheDocument();
    });

    it('does not render message when not provided', () => {
      const { container } = render(<InlineLoader />);
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBe(0);
    });

    it('accepts custom className', () => {
      const { container } = render(<InlineLoader className="mt-4" />);
      expect(container.firstChild).toHaveClass('mt-4');
    });
  });

  describe('ButtonLoader', () => {
    it('renders children when not loading', () => {
      render(<ButtonLoader isLoading={false}>저장</ButtonLoader>);
      expect(screen.getByText('저장')).toBeInTheDocument();
    });

    it('renders spinner and children when loading', () => {
      const { container } = render(<ButtonLoader isLoading={true}>저장</ButtonLoader>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('저장')).toBeInTheDocument();
    });

    it('renders loadingText when loading and provided', () => {
      render(<ButtonLoader isLoading={true} loadingText="저장 중...">저장</ButtonLoader>);
      expect(screen.getByText('저장 중...')).toBeInTheDocument();
    });

    it('does not render spinner when not loading', () => {
      const { container } = render(<ButtonLoader isLoading={false}>저장</ButtonLoader>);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  describe('SectionLoader', () => {
    it('renders children', () => {
      render(
        <SectionLoader isLoading={false}>
          <div>콘텐츠</div>
        </SectionLoader>
      );
      expect(screen.getByText('콘텐츠')).toBeInTheDocument();
    });

    it('shows overlay with spinner when loading', () => {
      const { container } = render(
        <SectionLoader isLoading={true}>
          <div>콘텐츠</div>
        </SectionLoader>
      );
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.getByText('콘텐츠')).toBeInTheDocument();
    });

    it('does not show overlay when not loading', () => {
      const { container } = render(
        <SectionLoader isLoading={false}>
          <div>콘텐츠</div>
        </SectionLoader>
      );
      const overlay = container.querySelector('.absolute.inset-0');
      expect(overlay).not.toBeInTheDocument();
    });

    it('accepts custom className', () => {
      const { container } = render(
        <SectionLoader isLoading={false} className="mt-8">
          <div>콘텐츠</div>
        </SectionLoader>
      );
      expect(container.firstChild).toHaveClass('relative', 'mt-8');
    });
  });
});
