import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createOrUpdate(
    userId: string,
    gameId: string,
    body: string,
    isSpoiler = false,
  ) {
    const game =
      await this.prisma.game.findUnique({
        where: {
          id: gameId,
        },
      });

    if (!game) {
      throw new NotFoundException(
        'Jogo não encontrado.',
      );
    }

    return this.prisma.review.upsert({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },

      update: {
        body,
        isSpoiler,
      },

      create: {
        userId,
        gameId,
        body,
        isSpoiler,
      },
    });
  }

  async getByGame(gameId: string) {
  const game = await this.prisma.game.findUnique({
    where: {
      id: gameId,
    },
  });

  if (!game) {
    throw new NotFoundException(
      'Jogo não encontrado.',
    );
  }

  return this.prisma.review.findMany({
    where: {
      gameId,
      isHidden: false,
    },

    select: {
      id: true,
      body: true,
      isSpoiler: true,
      createdAt: true,
      updatedAt: true,

      _count: {
        select: {
          likes: true,
        },
      },

      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,

          ratings: {
            where: {
              gameId,
            },

            select: {
              score: true,
            },

            take: 1,
          },
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}

async deleteReview(
  userId: string,
  gameId: string,
) {
  const review =
    await this.prisma.review.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

  if (!review) {
    throw new NotFoundException(
      'Review não encontrada.',
    );
  }

  await this.prisma.review.delete({
    where: {
      id: review.id,
    },
  });

  return {
    message: 'Review removida com sucesso.',
  };
}

async likeReview(
  userId: string,
  reviewId: string,
) {
  const review =
    await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

  if (!review) {
    throw new NotFoundException(
      'Review não encontrada.',
    );
  }

  return this.prisma.reviewLike.upsert({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },

    update: {},

    create: {
      userId,
      reviewId,
    },
  });
}

async unlikeReview(
  userId: string,
  reviewId: string,
) {
  const like =
    await this.prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

  if (!like) {
    throw new NotFoundException(
      'Curtida não encontrada.',
    );
  }

  await this.prisma.reviewLike.delete({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  return {
    message: 'Curtida removida com sucesso.',
  };
}

async getMyLikedReviews(
  userId: string,
  gameId: string,
) {
  const likes =
    await this.prisma.reviewLike.findMany({
      where: {
        userId,

        review: {
          gameId,
        },
      },

      select: {
        reviewId: true,
      },
    });

  return likes.map(
    (like) => like.reviewId,
  );
}
}