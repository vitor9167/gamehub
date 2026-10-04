import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { IgdbService } from '../igdb/igdb.service';

import {
  Prisma,
} from '../generated/prisma/client';

import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FindGamesDto } from './dto/find-games.dto';

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly igdbService: IgdbService,
    
  ) {}

  private formatIgdbCoverUrl(
  url?: string | null,
): string | null {
  if (!url) {
    return null;
  }

  const normalizedUrl =
    url.startsWith("//")
      ? `https:${url}`
      : url;

  return normalizedUrl.replace(
    "/t_thumb/",
    "/t_cover_big_2x/",
  );
}
  

  async findAll(filters: FindGamesDto) {
    const {
      search,
      genre,
      platform,
      page = 1,
      limit = 12,
    } = filters;

    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),

      ...(genre && {
        genres: {
          some: {
            genre: {
              name: {
                equals: genre,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      }),

      ...(platform && {
        platforms: {
          some: {
            platform: {
              name: {
                equals: platform,
                mode: 'insensitive' as const,
              },
            },
          },
        },
      }),
    };

    const [games, total] =
      await Promise.all([
        this.prisma.game.findMany({
          where,

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

          orderBy: {
            title: 'asc',
          },

          skip,
          take: limit,
        }),

        this.prisma.game.count({
          where,
        }),
      ]);

    const items = games.map(
      (game) => ({
        id: game.id,
        igdbId: game.igdbId,
        title: game.title,
        slug: game.slug,
        description: game.description,
        coverUrl: game.coverUrl,
        releaseDate: game.releaseDate,

        genres: game.genres.map(
          (item) => ({
            id: item.genre.id,
            name: item.genre.name,
          }),
        ),

        platforms:
          game.platforms.map(
            (item) => ({
              id: item.platform.id,
              name: item.platform.name,
            }),
          ),
      }),
    );

    return {
      items,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const game =
      await this.prisma.game.findUnique({
        where: {
          id,
        },
      });

    if (!game) {
      throw new NotFoundException(
        `Jogo com ID "${id}" não encontrado.`,
      );
    }

    return game;
  }

  async findBySlug(slug: string) {
    const game =
      await this.prisma.game.findUnique({
        where: {
          slug,
        },

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

          developers: {
            include: {
              developer: true,
            },
          },

          publishers: {
            include: {
              publisher: true,
            },
          },
        },
      });

    if (!game) {
      throw new NotFoundException(
        'Jogo não encontrado.',
      );
    }

    return {
      id: game.id,
      igdbId: game.igdbId,
      title: game.title,
      slug: game.slug,
      description: game.description,
      coverUrl: game.coverUrl,
      releaseDate: game.releaseDate,

      genres: game.genres.map(
        (item) => item.genre,
      ),

      platforms:
        game.platforms.map(
          (item) =>
            item.platform,
        ),

      developers:
        game.developers.map(
          (item) =>
            item.developer,
        ),

      publishers:
        game.publishers.map(
          (item) =>
            item.publisher,
        ),
    };
  }

  async create(
    dto: CreateGameDto,
  ) {
    try {
      return await this.prisma.game.create({
        data: {
          title: dto.title,
          slug: dto.slug,
        },
      });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          Array.isArray(
            error.meta?.target,
          )
            ? error.meta.target
            : [];

        if (
          target.includes('slug')
        ) {
          throw new ConflictException(
            'Já existe um jogo com este slug.',
          );
        }

        throw new ConflictException(
          'Já existe um jogo com esses dados.',
        );
      }

      throw error;
    }
  }

  async update(
    id: string,
    updateGameDto: UpdateGameDto,
  ) {
    await this.findOne(id);

    try {
      return await this.prisma.game.update({
        where: {
          id,
        },

        data:
          updateGameDto,
      });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Já existe um jogo com esses dados.',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.game.delete({
      where: {
        id,
      },
    });
  }

  async getFilters() {
    const [
      genres,
      platforms,
    ] = await Promise.all([
      this.prisma.genre.findMany({
        orderBy: {
          name: 'asc',
        },
      }),

      this.prisma.platform.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return {
      genres,
      platforms,
    };
  }

  async importFromIgdb(
    id: number,
  ) {
    const igdbGame =
      await this.igdbService.getGameById(
        id,
      );

    if (!igdbGame) {
      throw new NotFoundException(
        'Jogo não encontrado na IGDB.',
      );
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const game =
            await tx.game.upsert({
              where: {
                igdbId: id,
              },

              update: {
                title:
                  igdbGame.name,

                slug:
                  igdbGame.slug,

                description:
                  igdbGame.summary ??
                  null,

                coverUrl:
                  this.formatIgdbCoverUrl(
                    igdbGame.cover?.url,
                  ),

                releaseDate:
                  igdbGame.first_release_date
                    ? new Date(
                        igdbGame.first_release_date *
                          1000,
                      )
                    : null,

                externalSource:
                  'IGDB',

                externalId:
                  String(
                    igdbGame.id,
                  ),
              },

              create: {
                igdbId: id,

                title:
                  igdbGame.name,

                slug:
                  igdbGame.slug,

                description:
                  igdbGame.summary ??
                  null,

                coverUrl:
                this.formatIgdbCoverUrl(
                  igdbGame.cover?.url,
                ),

                releaseDate:
                  igdbGame.first_release_date
                    ? new Date(
                        igdbGame.first_release_date *
                          1000,
                      )
                    : null,

                externalSource:
                  'IGDB',

                externalId:
                  String(
                    igdbGame.id,
                  ),
              },
            });

          await tx.gameGenre.deleteMany({
            where: {
              gameId:
                game.id,
            },
          });

          await tx.gamePlatform.deleteMany({
            where: {
              gameId:
                game.id,
            },
          });

          await tx.gameDeveloper.deleteMany({
            where: {
              gameId:
                game.id,
            },
          });

          await tx.gamePublisher.deleteMany({
            where: {
              gameId:
                game.id,
            },
          });

          for (
            const igdbGenre
            of igdbGame.genres ??
            []
          ) {
            const genre =
              await tx.genre.upsert({
                where: {
                  name:
                    igdbGenre.name,
                },

                update: {},

                create: {
                  name:
                    igdbGenre.name,
                },
              });

            await tx.gameGenre.create({
              data: {
                gameId:
                  game.id,

                genreId:
                  genre.id,
              },
            });
          }

          for (
            const igdbPlatform
            of igdbGame.platforms ??
            []
          ) {
            const platform =
              await tx.platform.upsert({
                where: {
                  name:
                    igdbPlatform.name,
                },

                update: {},

                create: {
                  name:
                    igdbPlatform.name,
                },
              });

            await tx.gamePlatform.create({
              data: {
                gameId:
                  game.id,

                platformId:
                  platform.id,
              },
            });
          }

          for (
            const company
            of igdbGame.involved_companies ??
            []
          ) {
            if (
              !company.company?.name
            ) {
              continue;
            }

            if (
              company.developer
            ) {
              const developer =
                await tx.developer.upsert({
                  where: {
                    name:
                      company.company.name,
                  },

                  update: {},

                  create: {
                    name:
                      company.company.name,
                  },
                });

              await tx.gameDeveloper.create({
                data: {
                  gameId:
                    game.id,

                  developerId:
                    developer.id,
                },
              });
            }

            if (
              company.publisher
            ) {
              const publisher =
                await tx.publisher.upsert({
                  where: {
                    name:
                      company.company.name,
                  },

                  update: {},

                  create: {
                    name:
                      company.company.name,
                  },
                });

              await tx.gamePublisher.create({
                data: {
                  gameId:
                    game.id,

                  publisherId:
                    publisher.id,
                },
              });
            }
          }

          const importedGame =
            await tx.game.findUnique({
              where: {
                id:
                  game.id,
              },

              include: {
                genres: {
                  include: {
                    genre:
                      true,
                  },
                },

                platforms: {
                  include: {
                    platform:
                      true,
                  },
                },

                developers: {
                  include: {
                    developer:
                      true,
                  },
                },

                publishers: {
                  include: {
                    publisher:
                      true,
                  },
                },
              },
            });

          if (!importedGame) {
            throw new NotFoundException(
              'Jogo importado não encontrado.',
            );
          }

          return {
            message:
              'Jogo importado com sucesso.',

            game: {
              id:
                importedGame.id,

              igdbId:
                importedGame.igdbId,

              title:
                importedGame.title,

              slug:
                importedGame.slug,

              description:
                importedGame.description,

              coverUrl:
                importedGame.coverUrl,

              releaseDate:
                importedGame.releaseDate,

              genres:
                importedGame.genres.map(
                  (item) =>
                    item.genre,
                ),

              platforms:
                importedGame.platforms.map(
                  (item) =>
                    item.platform,
                ),

              developers:
                importedGame.developers.map(
                  (item) =>
                    item.developer,
                ),

              publishers:
                importedGame.publishers.map(
                  (item) =>
                    item.publisher,
                ),
            },
          };
        },
      );
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          Array.isArray(
            error.meta?.target,
          )
            ? error.meta.target
            : [];

        if (
          target.includes(
            'slug',
          )
        ) {
          throw new ConflictException(
            'Já existe um jogo com este slug.',
          );
        }

        if (
          target.includes(
            'igdbId',
          )
        ) {
          throw new ConflictException(
            'Este jogo da IGDB já está cadastrado.',
          );
        }

        throw new ConflictException(
          'Já existe um jogo com esses dados.',
        );
      }

      throw error;
    }
  }
}