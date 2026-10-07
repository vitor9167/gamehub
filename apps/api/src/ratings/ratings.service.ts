import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async rateGame(
    userId: string,
    gameId: string,
    score: number,
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

    const existingRating =
      await this.prisma.rating.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

    return this.prisma.$transaction(
      async (tx) => {
        const rating =
          await tx.rating.upsert({
            where: {
              userId_gameId: {
                userId,
                gameId,
              },
            },

            update: {
              score,
            },

            create: {
              userId,
              gameId,
              score,
            },
          });

        if (
          !existingRating ||
          existingRating.score !== score
        ) {
          await tx.activity.create({
            data: {
              type: existingRating
                ? 'RATING_UPDATED'
                : 'RATING_CREATED',

              userId,
              gameId,
              ratingScore: score,
            },
          });
        }

        return rating;
      },
    );
  }

  async getGameRating(
    userId: string,
    gameId: string,
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

    const [
      userRating,
      aggregate,
    ] = await Promise.all([
      this.prisma.rating.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      }),

      this.prisma.rating.aggregate({
        where: {
          gameId,
        },

        _avg: {
          score: true,
        },

        _count: {
          score: true,
        },
      }),
    ]);

    return {
      userScore:
        userRating?.score ?? null,

      averageScore:
        aggregate._avg.score ?? null,

      totalRatings:
        aggregate._count.score,
    };
  }
}