import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState, NetworkError, EmptyState } from './error-state';

describe('Error State Components', () => {
  describe('ErrorState', () => {
    it('renders with default message', () => {
      render(<ErrorState />);
      expect(screen.getByText('데이터를 불러올 수 없습니다.')).toBeInTheDocument();
    });

    it('renders custom title and message', () => {
      render(
        <ErrorState 
          title="커스텀 에러" 
          message="문제가 발생했습니다" 
        />
      );
      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(<ErrorState onRetry={onRetry} />);
      
      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('renders inline variant', () => {
      const { container } = render(
        <ErrorState message="인라인 에러" variant="inline" />
      );
      expect(container.firstChild).toHaveClass('flex');
      expect(container.firstChild).toHaveClass('items-center');
    });

    it('renders card variant with border', () => {
      const { container } = render(
        <ErrorState message="카드 에러" variant="card" />
      );
      expect(container.firstChild).toHaveClass('border');
      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('does not render retry button when onRetry is not provided', () => {
      render(<ErrorState />);
      expect(screen.queryByText('다시 시도')).not.toBeInTheDocument();
    });
  });

  describe('NetworkError', () => {
    it('renders network error message', () => {
      render(<NetworkError />);
      expect(screen.getByText('네트워크 연결 오류')).toBeInTheDocument();
      expect(screen.getByText('인터넷 연결을 확인해주세요.')).toBeInTheDocument();
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(<NetworkError onRetry={onRetry} />);
      
      const retryButton = screen.getByText('다시 시도');
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('EmptyState', () => {
    it('renders with default title', () => {
      render(<EmptyState />);
      expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument();
    });

    it('renders custom title and message', () => {
      render(
        <EmptyState 
          title="검색 결과 없음" 
          message="다른 키워드로 검색해보세요" 
        />
      );
      expect(screen.getByText('검색 결과 없음')).toBeInTheDocument();
      expect(screen.getByText('다른 키워드로 검색해보세요')).toBeInTheDocument();
    });

    it('renders custom action', () => {
      render(
        <EmptyState 
          title="데이터 없음"
          action={<button>새로 만들기</button>}
        />
      );
      expect(screen.getByText('새로 만들기')).toBeInTheDocument();
    });

    it('renders custom icon', () => {
      render(
        <EmptyState 
          title="아이콘 테스트"
          icon={<span data-testid="custom-icon">🔍</span>}
        />
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});
