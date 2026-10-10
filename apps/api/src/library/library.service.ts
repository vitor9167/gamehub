import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AddGameToLibraryDto } from './dto/add-game-to-library.dto';
import { GameStatus } from '../generated/prisma/client';

@Injectable()
export class LibraryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async addGame(
    userId: string,
    gameId: string,
    dto: AddGameToLibraryDto,
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

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado.',
      );
    }

    const existingEntry =
      await this.prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

    return this.prisma.$transaction(
      async (tx) => {
        const libraryEntry =
          await tx.userGame.upsert({
            where: {
              userId_gameId: {
                userId,
                gameId,
              },
            },

            update: {
              status: dto.status,
            },

            create: {
              userId,
              gameId,
              status: dto.status,
            },

            include: {
              game: true,
            },
          });

        if (!existingEntry) {
          await tx.activity.create({
            data: {
              type: 'LIBRARY_ADDED',
              userId,
              gameId,
              status: dto.status,
            },
          });
        } else if (
          existingEntry.status !==
          dto.status
        ) {
          await tx.activity.create({
            data: {
              type:
                'LIBRARY_STATUS_CHANGED',

              userId,
              gameId,
              status: dto.status,
            },
          });
        }

        return libraryEntry;
      },
    );
  }

  async findByUser(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Usuário não encontrado.',
      );
    }

    return this.prisma.userGame.findMany({
      where: {
        userId,
      },

      include: {
        game: {
          include: {
            genres: {
              include: {
                genre: true,
              },
            },

            platforms: {
              include: {
                platform: true,
              },
            },
          },
        },
      },

      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async updateStatus(
    userId: string,
    gameId: string,
    status: GameStatus,
  ) {
    const libraryGame =
      await this.prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

    if (!libraryGame) {
      throw new NotFoundException(
        'Jogo não encontrado na biblioteca do usuário.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const updatedEntry =
          await tx.userGame.update({
            where: {
              userId_gameId: {
                userId,
                gameId,
              },
            },

            data: {
              status,
            },

            include: {
              game: true,
            },
          });

        if (
          libraryGame.status !==
          status
        ) {
          await tx.activity.create({
            data: {
              type:
                'LIBRARY_STATUS_CHANGED',

              userId,
              gameId,
              status,
            },
          });
        }

        return updatedEntry;
      },
    );
  }

  async setFavorite(
  userId: string,
  gameId: string,
  isFavorite: boolean,
) {
  const libraryGame =
    await this.prisma.userGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },

      select: {
        id: true,
        isFavorite: true,
      },
    });

  if (!libraryGame) {
    throw new NotFoundException(
      'Jogo não encontrado na biblioteca do usuário.',
    );
  }

  if (
    isFavorite &&
    !libraryGame.isFavorite
  ) {
    const favoriteCount =
      await this.prisma.userGame.count({
        where: {
          userId,
          isFavorite: true,
        },
      });

    if (favoriteCount >= 5) {
      throw new BadRequestException(
        'Você pode ter no máximo 5 jogos favoritos.',
      );
    }
  }

  const updatedEntry =
    await this.prisma.userGame.update({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },

      data: {
        isFavorite,
      },

      include: {
        game: true,
      },
    });

  return {
    id: updatedEntry.id,
    gameId: updatedEntry.gameId,
    isFavorite:
      updatedEntry.isFavorite,

    game: {
      id: updatedEntry.game.id,
      title:
        updatedEntry.game.title,
      slug:
        updatedEntry.game.slug,
      coverUrl:
        updatedEntry.game.coverUrl,
    },
  };
}

  async removeGame(
    userId: string,
    gameId: string,
  ) {
    const libraryGame =
      await this.prisma.userGame.findUnique({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
      });

    if (!libraryGame) {
      throw new NotFoundException(
        'Jogo não encontrado na biblioteca do usuário.',
      );
    }

    await this.prisma.userGame.delete({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    return {
      message:
        'Jogo removido da biblioteca com sucesso.',
    };
  }

  async findOne(
    userId: string,
    gameId: string,
  ) {
    return this.prisma.userGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },

      include: {
        game: true,
      },
    });
  }
}