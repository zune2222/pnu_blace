import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(['ios', 'android'])
  platform: 'ios' | 'android';
}

export class UnregisterTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}
