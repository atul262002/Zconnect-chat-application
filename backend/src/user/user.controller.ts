import { Controller, Get, Query, BadRequestException, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtMiddleware } from '../Middleware/jwt.middlware';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async searchUser(
    @Query('search-user') searchTerm: string,
    @Query('offset') offset: number,
    @Req() req
  ) {
    try {
      if (!searchTerm || !offset) {
        throw new BadRequestException('Invalid search query or missing parameters');
      }
      const users = await this.userService.searchUser(searchTerm, offset);
      return users;
    } catch (error) {
      throw new BadRequestException('Failed to search for users.');
    }
  }

  @Get('/profile')
  async getUserProfile(@Req() req: Request) {
    try {
      const userId = req['userId'];
      const userProfile = await this.userService.getUserProfile(userId);
      return userProfile;
    } catch (error) {
      throw new NotFoundException('User profile not found.');
    }
  }
}
