import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserProfileDto } from '@pnu-blace/types';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@Request() req): Promise<UserProfileDto> {
    const user = req.user; // JWT Guard에서 주입된 User 엔티티
    return this.usersService.getProfile(user.studentId);
  }
}
