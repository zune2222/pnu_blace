import { describe, it, expect } from 'vitest';
import { validateLoginForm, isValidForm } from './validation';
import type { LoginFormData, LoginFormErrors } from '../model/types';

describe('Login Validation', () => {
  describe('validateLoginForm', () => {
    it('returns error when studentId is empty', () => {
      const formData: LoginFormData = { studentId: '', password: 'password123', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.studentId).toBe('학번을 입력해주세요');
    });

    it('returns error when studentId is not 9 digits', () => {
      const formData: LoginFormData = { studentId: '12345', password: 'password123', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.studentId).toBe('올바른 학번 형식을 입력해주세요 (9자리 숫자)');
    });

    it('returns error when studentId has letters', () => {
      const formData: LoginFormData = { studentId: '12345678a', password: 'password123', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.studentId).toBe('올바른 학번 형식을 입력해주세요 (9자리 숫자)');
    });

    it('returns no error for valid 9-digit studentId', () => {
      const formData: LoginFormData = { studentId: '202012345', password: 'password123', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.studentId).toBeUndefined();
    });

    it('returns error when password is empty', () => {
      const formData: LoginFormData = { studentId: '202012345', password: '', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.password).toBe('비밀번호를 입력해주세요');
    });

    it('returns error when password is less than 6 characters', () => {
      const formData: LoginFormData = { studentId: '202012345', password: '12345', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.password).toBe('비밀번호는 최소 6자 이상이어야 합니다');
    });

    it('returns no error for valid password', () => {
      const formData: LoginFormData = { studentId: '202012345', password: 'password123', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.password).toBeUndefined();
    });

    it('returns multiple errors for invalid form', () => {
      const formData: LoginFormData = { studentId: '', password: '', rememberMe: false };
      const errors = validateLoginForm(formData);
      expect(errors.studentId).toBeDefined();
      expect(errors.password).toBeDefined();
    });

    it('returns empty object for valid form', () => {
      const formData: LoginFormData = { studentId: '202012345', password: 'password123', rememberMe: true };
      const errors = validateLoginForm(formData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('handles rememberMe flag correctly', () => {
      const formData: LoginFormData = { studentId: '202012345', password: 'password123', rememberMe: true };
      const errors = validateLoginForm(formData);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('isValidForm', () => {
    it('returns true when no errors', () => {
      const errors: LoginFormErrors = {};
      expect(isValidForm(errors)).toBe(true);
    });

    it('returns false when has studentId error', () => {
      const errors: LoginFormErrors = { studentId: '학번을 입력해주세요' };
      expect(isValidForm(errors)).toBe(false);
    });

    it('returns false when has password error', () => {
      const errors: LoginFormErrors = { password: '비밀번호를 입력해주세요' };
      expect(isValidForm(errors)).toBe(false);
    });

    it('returns false when has general error', () => {
      const errors: LoginFormErrors = { general: '로그인에 실패했습니다' };
      expect(isValidForm(errors)).toBe(false);
    });

    it('returns false when has multiple errors', () => {
      const errors: LoginFormErrors = { 
        studentId: '학번을 입력해주세요',
        password: '비밀번호를 입력해주세요'
      };
      expect(isValidForm(errors)).toBe(false);
    });
  });
});
