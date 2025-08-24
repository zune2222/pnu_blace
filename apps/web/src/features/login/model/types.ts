export interface LoginFormData {
  studentId: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  studentId?: string;
  password?: string;
  general?: string;
}
