import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateRecommendationDto,
  ) {
    if (
      dto.sourceGameId ===
      dto.recommendedGameId
    ) {
      throw new BadRequestException(
        'Não é possível recomendar um jogo para ele mesmo.',
      );
    }

    const [
      sourceGame,
      recommendedGame,
    ] = await Promise.all([
      this.prisma.game.findUnique({
        where: {
          id: dto.sourceGameId,
        },
      }),

      this.prisma.game.findUnique({
        where: {
          id: dto.recommendedGameId,
        },
      }),
    ]);

    if (!sourceGame) {
      throw new NotFoundException(
        'Jogo de origem não encontrado.',
      );
    }

    if (!recommendedGame) {
      throw new NotFoundException(
        'Jogo recomendado não encontrado.',
      );
    }

    const existing =
      await this.prisma.gameRecommendation.findUnique({
        where: {
          userId_sourceGameId_recommendedGameId: {
            userId,
            sourceGameId:
              dto.sourceGameId,
            recommendedGameId:
              dto.recommendedGameId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Você já criou uma recomendação entre estes jogos.',
      );
    }

   return this.prisma.$transaction(
    async (tx) => {
        const recommendation =
        await tx.gameRecommendation.create({
            data: {
            userId,

            sourceGameId:
                dto.sourceGameId,

            recommendedGameId:
                dto.recommendedGameId,

            body:
                dto.body,

            aspects: {
                create:
                dto.aspects.map(
                    (type) => ({
                    type,
                    }),
                ),
            },
            },

            include: {
            user: {
                select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                },
            },

            sourceGame: {
                select: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
                },
            },

            recommendedGame: {
                select: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
                },
            },

            aspects: true,
            },
        });

        await tx.activity.create({
        data: {
            type:
            'RECOMMENDATION_CREATED',

            userId,

            gameId:
            dto.sourceGameId,

            recommendationId:
            recommendation.id,
        },
        });

        return recommendation;
    },
    );
  }

  async findByGame(
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

  const recommendations =
    await this.prisma.gameRecommendation.findMany({
      where: {
        sourceGameId: gameId,
      },

     orderBy: [
        {
            supports: {
            _count: 'desc',
            },
        },
        {
            createdAt: 'desc',
        },
        ],

      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },

        recommendedGame: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },

        aspects: true,

        _count: {
          select: {
            supports: true,
          },
        },
      },
    });

  return recommendations.map(
    ({
      _count,
      ...recommendation
    }) => ({
      ...recommendation,

      supportCount:
        _count.supports,

      supportedByMe:
        false,
    }),
  );
}
  async findOne(
    recommendationId: string,
  ) {
    const recommendation =
      await this.prisma.gameRecommendation.findUnique({
        where: {
          id: recommendationId,
        },

        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },

          sourceGame: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
            },
          },

          recommendedGame: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
            },
          },

          aspects: true,
        },
      });

    if (!recommendation) {
      throw new NotFoundException(
        'Recomendação não encontrada.',
      );
    }

    return recommendation;
  }

  async update(
    userId: string,
    recommendationId: string,
    dto: UpdateRecommendationDto,
  ) {
    const recommendation =
      await this.prisma.gameRecommendation.findUnique({
        where: {
          id: recommendationId,
        },
      });

    if (!recommendation) {
      throw new NotFoundException(
        'Recomendação não encontrada.',
      );
    }

    if (
      recommendation.userId !==
      userId
    ) {
      throw new BadRequestException(
        'Você não pode editar esta recomendação.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        if (dto.aspects) {
          await tx.recommendationAspect.deleteMany({
            where: {
              recommendationId,
            },
          });
        }

        return tx.gameRecommendation.update({
          where: {
            id: recommendationId,
          },

          data: {
            body:
              dto.body,

            ...(dto.aspects
              ? {
                  aspects: {
                    create:
                      dto.aspects.map(
                        (type) => ({
                          type,
                        }),
                      ),
                  },
                }
              : {}),
          },

          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },

            sourceGame: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
              },
            },

            recommendedGame: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
              },
            },

            aspects: true,
          },
        });
      },
    );
  }

  async remove(
    userId: string,
    recommendationId: string,
  ) {
    const recommendation =
      await this.prisma.gameRecommendation.findUnique({
        where: {
          id: recommendationId,
        },
      });

    if (!recommendation) {
      throw new NotFoundException(
        'Recomendação não encontrada.',
      );
    }

    if (
      recommendation.userId !==
      userId
    ) {
      throw new BadRequestException(
        'Você não pode remover esta recomendação.',
      );
    }

    await this.prisma.gameRecommendation.delete({
      where: {
        id: recommendationId,
      },
    });

    return {
      message:
        'Recomendação removida com sucesso.',
    };
  }

  async support(
  userId: string,
  recommendationId: string,
) {
  const recommendation =
    await this.prisma.gameRecommendation.findUnique({
      where: {
        id: recommendationId,
      },
    });

  if (!recommendation) {
    throw new NotFoundException(
      'Recomendação não encontrada.',
    );
  }

  if (
    recommendation.userId ===
    userId
    ) {
    throw new BadRequestException(
        'Você já é o autor desta recomendação.',
    );
    }

  await this.prisma.recommendationSupport.upsert({
    where: {
      userId_recommendationId: {
        userId,
        recommendationId,
      },
    },

    update: {},

    create: {
      userId,
      recommendationId,
    },
  });

  const supportCount =
    await this.prisma.recommendationSupport.count({
      where: {
        recommendationId,
      },
    });

  return {
    supportedByMe: true,
    supportCount,
  };
}

async removeSupport(
  userId: string,
  recommendationId: string,
) {
  const recommendation =
    await this.prisma.gameRecommendation.findUnique({
      where: {
        id: recommendationId,
      },
    });

  if (!recommendation) {
    throw new NotFoundException(
      'Recomendação não encontrada.',
    );
  }

  await this.prisma.recommendationSupport.deleteMany({
    where: {
      userId,
      recommendationId,
    },
  });

  const supportCount =
    await this.prisma.recommendationSupport.count({
      where: {
        recommendationId,
      },
    });

  return {
    supportedByMe: false,
    supportCount,
  };
}

async findByGameForUser(
  gameId: string,
  userId: string,
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

  const recommendations =
    await this.prisma.gameRecommendation.findMany({
      where: {
        sourceGameId: gameId,
      },

      orderBy: [
        {
            supports: {
            _count: 'desc',
            },
        },
        {
            createdAt: 'desc',
        },
        ],

      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },

        recommendedGame: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },

        aspects: true,

        supports: {
          select: {
            userId: true,
          },
        },
      },
    });

  return recommendations.map(
    (recommendation) => {
      const supportCount =
        recommendation.supports.length;

      const supportedByMe =
        recommendation.supports.some(
          (support) =>
            support.userId ===
            userId,
        );

      const {
        supports,
        ...rest
      } = recommendation;

      return {
        ...rest,
        supportCount,
        supportedByMe,
      };
    },
  );
}
}