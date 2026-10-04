import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Delete,
  UseGuards,
  Get,
} from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';

import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('games')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post(':gameId/review')
  @UseGuards(AuthGuard)
  createOrUpdate(
  @Req() request: any,
  @Param('gameId', ParseUUIDPipe)
  gameId: string,
  @Body() dto: CreateReviewDto,
) {
  return this.reviewsService.createOrUpdate(
    request.user.sub,
    gameId,
    dto.body,
    dto.isSpoiler ?? false,
  );
}

  @Get(':gameId/reviews')
  getByGame(
  @Param('gameId', ParseUUIDPipe)
  gameId: string,
) {
  return this.reviewsService.getByGame(
    gameId,
  );
}

@Delete(':gameId/review')
@UseGuards(AuthGuard)
deleteReview(
  @Req() request: any,
  @Param('gameId', ParseUUIDPipe)
  gameId: string,
) {
  return this.reviewsService.deleteReview(
    request.user.sub,
    gameId,
  );
}

@Post('/reviews/:reviewId/like')
@UseGuards(AuthGuard)
likeReview(
  @Req() request: any,
  @Param('reviewId', ParseUUIDPipe)
  reviewId: string,
) {
  return this.reviewsService.likeReview(
    request.user.sub,
    reviewId,
  );
}

@Delete('/reviews/:reviewId/like')
@UseGuards(AuthGuard)
unlikeReview(
  @Req() request: any,
  @Param('reviewId', ParseUUIDPipe)
  reviewId: string,
) {
  return this.reviewsService.unlikeReview(
    request.user.sub,
    reviewId,
  );
}

@Get(':gameId/reviews/likes/me')
@UseGuards(AuthGuard)
getMyLikedReviews(
  @Req() request: any,
  @Param('gameId', ParseUUIDPipe)
  gameId: string,
) {
  return this.reviewsService.getMyLikedReviews(
    request.user.sub,
    gameId,
  );
}
}