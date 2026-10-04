import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { LibraryService } from './library.service';
import { AddGameToLibraryDto } from './dto/add-game-to-library.dto';
import { UpdateLibraryStatusDto } from './dto/update-library-status.dto';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('library')
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
  ) {}

  @Post('games/:gameId')
  addGame(
    @Req() request: any,
    @Param('gameId', ParseUUIDPipe)
gameId: string,
    @Body() dto: AddGameToLibraryDto,
  ) {
    return this.libraryService.addGame(
      request.user.sub,
      gameId,
      dto,
    );
  }

  @Get()
  findByUser(
    @Req() request: any,
  ) {
    return this.libraryService.findByUser(
      request.user.sub,
    );
  }

  @Get('games/:gameId')
  findOne(
    @Req() request: any,
    @Param('gameId', ParseUUIDPipe)
gameId: string,
  ) {
    return this.libraryService.findOne(
      request.user.sub,
      gameId,
    );
  }

  @Patch('games/:gameId/status')
  updateStatus(
    @Req() request: any,
    @Param('gameId', ParseUUIDPipe)
gameId: string,
    @Body() dto: UpdateLibraryStatusDto,
  ) {
    return this.libraryService.updateStatus(
      request.user.sub,
      gameId,
      dto.status,
    );
  }

  @Delete('games/:gameId')
  removeGame(
    @Req() request: any,
    @Param('gameId', ParseUUIDPipe)
gameId: string,
  ) {
    return this.libraryService.removeGame(
      request.user.sub,
      gameId,
    );
  }
}