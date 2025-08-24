import { UserProfileDto } from "@packages/types";

export type UserProfile = UserProfileDto;

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
