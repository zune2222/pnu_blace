import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './store';
import type { AuthState } from './types';

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });
});

describe('Auth Store', () => {
  describe('initial state', () => {
    it('has correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setAuthenticated', () => {
    it('sets authenticated state with user and token', () => {
      const mockUser: AuthState['user'] = {
        studentId: '202012345',
        name: '테스트유저',
      };
      
      useAuthStore.getState().setAuthenticated(mockUser, 'test-token-123');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token-123');
      expect(state.isLoading).toBe(false);
    });

    it('overwrites previous user data', () => {
      const user1: AuthState['user'] = { studentId: '111111111', name: '유저1' };
      const user2: AuthState['user'] = { studentId: '222222222', name: '유저2' };
      
      useAuthStore.getState().setAuthenticated(user1, 'token1');
      useAuthStore.getState().setAuthenticated(user2, 'token2');
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(user2);
      expect(state.token).toBe('token2');
    });
  });

  describe('setUnauthenticated', () => {
    it('clears all auth state', () => {
      // First set authenticated
      useAuthStore.getState().setAuthenticated(
        { studentId: '202012345', name: '테스트' },
        'token'
      );
      
      // Then set unauthenticated
      useAuthStore.getState().setUnauthenticated();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('sets loading to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateToken', () => {
    it('updates only the token', () => {
      const user: AuthState['user'] = { studentId: '202012345', name: '테스트' };
      useAuthStore.getState().setAuthenticated(user, 'old-token');
      
      useAuthStore.getState().updateToken('new-token');
      
      const state = useAuthStore.getState();
      expect(state.token).toBe('new-token');
      expect(state.user).toEqual(user); // User unchanged
      expect(state.isAuthenticated).toBe(true); // Still authenticated
    });
  });

  describe('logout', () => {
    it('clears all state on logout', () => {
      useAuthStore.getState().setAuthenticated(
        { studentId: '202012345', name: '테스트' },
        'token'
      );
      
      // Mock window
      const originalWindow = global.window;
      global.window = {
        ...originalWindow,
        location: { href: '' } as Location,
        localStorage: {
          removeItem: vi.fn(),
        } as unknown as Storage,
      } as unknown as Window & typeof globalThis;
      
      useAuthStore.getState().logout();
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      
      // Cleanup
      global.window = originalWindow;
    });
  });

  describe('selectors pattern', () => {
    it('can select specific state values', () => {
      useAuthStore.getState().setAuthenticated(
        { studentId: '202012345', name: '테스트' },
        'token'
      );
      
      // Test individual selectors
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const user = useAuthStore.getState().user;
      
      expect(isAuthenticated).toBe(true);
      expect(user?.studentId).toBe('202012345');
    });
  });
});
