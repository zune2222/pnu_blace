export interface UserProfile {
  studentId: string;
  name?: string;
  major?: string;
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
