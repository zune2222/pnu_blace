import type { LoginFormData, LoginFormErrors } from "../model/types";

export const validateLoginForm = (formData: LoginFormData): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  // 학번 유효성 검사
  if (!formData.studentId) {
    errors.studentId = "학번을 입력해주세요";
  } else if (!/^\d{10}$/.test(formData.studentId)) {
    errors.studentId = "올바른 학번 형식을 입력해주세요 (10자리 숫자)";
  }

  // 비밀번호 유효성 검사
  if (!formData.password) {
    errors.password = "비밀번호를 입력해주세요";
  } else if (formData.password.length < 6) {
    errors.password = "비밀번호는 최소 6자 이상이어야 합니다";
  }

  return errors;
};

export const isValidForm = (errors: LoginFormErrors): boolean => {
  return Object.keys(errors).length === 0;
};
