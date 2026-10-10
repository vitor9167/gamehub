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
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';

import { RecommendationsService } from './recommendations.service';

import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService:
      RecommendationsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() request: any,
    @Body()
    dto: CreateRecommendationDto,
  ) {
    return this.recommendationsService.create(
      request.user.sub,
      dto,
    );
  }

  @Get('game/:gameId')
  findByGame(
    @Param('gameId')
    gameId: string,
  ) {
    return this.recommendationsService.findByGame(
      gameId,
    );
  }

  @Get('game/:gameId/me')
@UseGuards(AuthGuard)
findByGameForUser(
  @Req() request: any,

  @Param('gameId')
  gameId: string,
) {
  return this.recommendationsService.findByGameForUser(
    gameId,
    request.user.sub,
  );
}

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.recommendationsService.findOne(
      id,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Req() request: any,
    @Param('id')
    id: string,
    @Body()
    dto: UpdateRecommendationDto,
  ) {
    return this.recommendationsService.update(
      request.user.sub,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(
    @Req() request: any,
    @Param('id')
    id: string,
  ) {
    return this.recommendationsService.remove(
      request.user.sub,
      id,
    );
  }

  @Post(':id/support')
@UseGuards(AuthGuard)
support(
  @Req() request: any,
  @Param('id')
  id: string,
) {
  return this.recommendationsService.support(
    request.user.sub,
    id,
  );
}

@Delete(':id/support')
@UseGuards(AuthGuard)
removeSupport(
  @Req() request: any,
  @Param('id')
  id: string,
) {
  return this.recommendationsService.removeSupport(
    request.user.sub,
    id,
  );
}
}