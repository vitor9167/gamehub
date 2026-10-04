import { Injectable,BadRequestException,NotFoundException,ConflictException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma/client';
import { UpdateGameDto } from './dto/update-game.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getStats() {
    const [
      users,
      games,
      genres,
      platforms,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.game.count(),
      this.prisma.genre.count(),
      this.prisma.platform.count(),
    ]);

    return {
      users,
      games,
      genres,
      platforms,
    };
  }

  async getUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
}

async updateUserRole(
  currentUserId: string,
  targetUserId: string,
  role: UserRole,
) {
  if (currentUserId === targetUserId) {
    throw new BadRequestException(
      'Você não pode alterar sua própria função.',
    );
  }

  const user = await this.prisma.user.findUnique({
    where: {
      id: targetUserId,
    },
  });

  if (!user) {
    throw new NotFoundException(
      'Usuário não encontrado.',
    );
  }

  return this.prisma.user.update({
    where: {
      id: targetUserId,
    },

    data: {
      role,
    },

    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
    },
  });
}

async getGames() {
  return this.prisma.game.findMany({
    select: {
      id: true,
      igdbId: true,
      title: true,
      slug: true,
      description: true,
      coverUrl: true,
      releaseDate: true,
      externalSource: true,
      createdAt: true,
      updatedAt: true,
    },

    orderBy: {
      title: 'asc',
    },
  });
}

async deleteGame(gameId: string) {
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

  await this.prisma.game.delete({
    where: {
      id: gameId,
    },
  });

  return {
    message: 'Jogo removido com sucesso.',
  };
}

async getGame(gameId: string) {
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

  return game;
}

async updateGame(
  gameId: string,
  dto: UpdateGameDto,
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

  try {
    return await this.prisma.game.update({
      where: {
        id: gameId,
      },

      data: {
        title: dto.title,
        slug: dto.slug,
        description: dto.description,
        coverUrl: dto.coverUrl,

        releaseDate: dto.releaseDate
          ? new Date(dto.releaseDate)
          : undefined,
      },
    });
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Já existe um jogo com esses dados únicos.',
      );
    }

    throw error;
  }
}
}