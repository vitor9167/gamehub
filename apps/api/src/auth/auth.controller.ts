import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
login(
  @Body() dto: LoginDto,
) {
  return this.authService.login(dto);
}

@UseGuards(AuthGuard)
@Get('me')
getMe(
  @Req() request: any,
) {
  return this.authService.getMe(
    request.user.sub,
  );
}

@UseGuards(AuthGuard)
@Patch('me')
updateMe(
  @Req() request: any,
  @Body() dto: UpdateProfileDto,
) {
  return this.authService.updateProfile(
    request.user.sub,
    dto,
  );
}

@UseGuards(AuthGuard)
@Patch('change-password')
changePassword(
  @Req() request: any,
  @Body() dto: ChangePasswordDto,
) {
  return this.authService.changePassword(
    request.user.sub,
    dto,
  );
}
}