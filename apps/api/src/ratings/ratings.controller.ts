import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  Get,
  ParseUUIDPipe,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';

import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsService } from './ratings.service';

@Controller('games')
@UseGuards(AuthGuard)
export class RatingsController {
  constructor(
    private readonly ratingsService:
      RatingsService,
  ) {}

  @Post(':gameId/rating')
  rateGame(
    @Req() request: any,
    @Param('gameId', ParseUUIDPipe)
gameId: string,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.rateGame(
      request.user.sub,
      gameId,
      dto.score,
    );
  }

  @Get(':gameId/rating')
getGameRating(
  @Req() request: any,
  @Param(
    'gameId',
    ParseUUIDPipe,
  )
  gameId: string,
) {
  return this.ratingsService.getGameRating(
    request.user.sub,
    gameId,
  );
}
}