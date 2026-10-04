import {
  Controller,
  Get,
  UseGuards,
  Body,
  Param,
  Patch,
  Req,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers() {
   return this.adminService.getUsers();
}

@Patch('users/:userId/role')
updateUserRole(
  @Req() request: any,
  @Param('userId', ParseUUIDPipe)
userId: string,
  @Body() dto: UpdateUserRoleDto,
) {
  return this.adminService.updateUserRole(
    request.user.sub,
    userId,
    dto.role,
  );
}

@Get('games')
getGames() {
  return this.adminService.getGames();
}

@Get('games/:gameId')
getGame(
  @Param('gameId', ParseUUIDPipe)
gameId: string
) {
  return this.adminService.getGame(gameId);
}

@Patch('games/:gameId')
updateGame(
  @Param('gameId', ParseUUIDPipe)
gameId: string,
  @Body() dto: UpdateGameDto,
) {
  return this.adminService.updateGame(
    gameId,
    dto,
  );
}

@Delete('games/:gameId')
deleteGame(
  @Param('gameId', ParseUUIDPipe)
gameId: string
) {
  return this.adminService.deleteGame(gameId);
}


}