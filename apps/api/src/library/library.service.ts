import {
  Injectable,
  NotFoundException,
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

  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundException(
      'Usuário não encontrado.',
    );
  }

  return this.prisma.userGame.upsert({
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
}

  async findByUser(userId: string) {
  const user = await this.prisma.user.findUnique({
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

  return this.prisma.userGame.update({
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
    message: 'Jogo removido da biblioteca com sucesso.',
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