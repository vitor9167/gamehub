import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { FindUsersDto } from "./dto/find-users.dto";
import { ActivityType, GameStatus,} from "../generated/prisma/client";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    filters: FindUsersDto,
  ) {
    const {
      search,
      page = 1,
      limit = 12,
    } = filters;

    const skip =
      (page - 1) * limit;

    const where = {
      isProfilePublic: true,

      ...(search && {
        OR: [
          {
            username: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            displayName: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };

    const [
      users,
      total,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where,

        select: {
          id: true,
          username: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,

          _count: {
            select: {
              library: true,
              reviews: true,
              ratings: true,
            },
          },
        },

        orderBy: {
          username: "asc",
        },

        skip,
        take: limit,
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    const items =
      users.map((user) => ({
        id: user.id,
        username:
          user.username,
        displayName:
          user.displayName,
        bio:
          user.bio,
        avatarUrl:
          user.avatarUrl,
        createdAt:
          user.createdAt,

        stats: {
          games:
            user._count.library,
          reviews:
            user._count.reviews,
          ratings:
            user._count.ratings,
        },
      }));

    return {
      items,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  }

 async findByUsername(
  username: string,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        isProfilePublic: true,
        isLibraryPublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

const [
  games,
  completed,
  reviews,
  ratings,
  recommendations,
  followers,
  following,
  playingNow,
  favorites,
] = await Promise.all([
  this.prisma.userGame.count({
    where: {
      userId: user.id,
    },
  }),

  this.prisma.userGame.count({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
  }),

  this.prisma.review.count({
    where: {
      userId: user.id,
      isHidden: false,
    },
  }),

  this.prisma.rating.count({
    where: {
      userId: user.id,
    },
  }),

  this.prisma.gameRecommendation.count({
    where: {
      userId: user.id,
    },
  }),

  this.prisma.userFollow.count({
    where: {
      followingId: user.id,
    },
  }),

  this.prisma.userFollow.count({
    where: {
      followerId: user.id,
    },
  }),

  user.isLibraryPublic
    ? this.prisma.userGame.findMany({
        where: {
          userId: user.id,
          status: "PLAYING",
        },

        select: {
          id: true,
          updatedAt: true,

          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              releaseDate: true,

              genres: {
                select: {
                  genre: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },

        take: 6,
      })
    : Promise.resolve([]),

  user.isLibraryPublic
    ? this.prisma.userGame.findMany({
        where: {
          userId: user.id,
          isFavorite: true,
        },

        select: {
          game: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverUrl: true,
              releaseDate: true,

              genres: {
                select: {
                  genre: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },

        take: 5,
      })
    : Promise.resolve([]),
]);

  return {
    id:
      user.id,

    username:
      user.username,

    displayName:
      user.displayName,

    bio:
      user.bio,

    avatarUrl:
      user.avatarUrl,

    createdAt:
      user.createdAt,

    isLibraryPublic:
      user.isLibraryPublic,

    stats: {
      games,
      completed,
      reviews,
      ratings,
      recommendations,
      followers,
      following,
    },

    playingNow:
      playingNow.map(
        (entry) => ({
          id:
            entry.game.id,

          title:
            entry.game.title,

          slug:
            entry.game.slug,

          coverUrl:
            entry.game.coverUrl,

          releaseDate:
            entry.game.releaseDate,

          genres:
            entry.game.genres.map(
              (item) =>
                item.genre,
            ),
        }),
      ),

          favorites:
      favorites.map(
        (entry) => ({
          id:
            entry.game.id,

          title:
            entry.game.title,

          slug:
            entry.game.slug,

          coverUrl:
            entry.game.coverUrl,

          releaseDate:
            entry.game.releaseDate,

          genres:
            entry.game.genres.map(
              (item) =>
                item.genre,
            ),
        }),
      ),
  };

  
}

 async findLibrary(
  username: string,
  page = 1,
  limit = 12,
  status?: string,
  search?: string,
  sort?: string,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
        isLibraryPublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  if (!user.isLibraryPublic) {
    return {
      isPrivate: true,
      items: [],

      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  const safePage =
    Math.max(page, 1);

  const safeLimit =
    Math.min(
      Math.max(limit, 1),
      50,
    );

  const validStatuses =
    Object.values(GameStatus);

  const selectedStatus =
    status &&
    validStatuses.includes(
      status as GameStatus,
    )
      ? (status as GameStatus)
      : undefined;

  const normalizedSearch =
    search?.trim() || undefined;

  const where = {
    userId: user.id,

    ...(selectedStatus && {
      status: selectedStatus,
    }),

    ...(normalizedSearch && {
      game: {
        title: {
          contains:
            normalizedSearch,

          mode:
            "insensitive" as const,
        },
      },
    }),
  };

  const orderBy =
    sort === "title"
      ? {
          game: {
            title:
              "asc" as const,
          },
        }
      : sort === "release"
        ? {
            game: {
              releaseDate:
                "desc" as const,
            },
          }
        : {
            updatedAt:
              "desc" as const,
          };

  const [
    library,
    total,
  ] = await Promise.all([
    this.prisma.userGame.findMany({
      where,

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

      orderBy,

      skip:
        (safePage - 1) *
        safeLimit,

      take:
        safeLimit,
    }),

    this.prisma.userGame.count({
      where,
    }),
  ]);

  const totalPages =
    Math.ceil(
      total / safeLimit,
    );

  return {
    isPrivate: false,

    items: library.map(
      (entry) => ({
        id: entry.id,

        status:
          entry.status,

        isFavorite:
          entry.isFavorite,

        game: {
          id:
            entry.game.id,

          title:
            entry.game.title,

          slug:
            entry.game.slug,

          description:
            entry.game.description,

          coverUrl:
            entry.game.coverUrl,

          releaseDate:
            entry.game.releaseDate,

          genres:
            entry.game.genres.map(
              (item) =>
                item.genre,
            ),

          platforms:
            entry.game.platforms.map(
              (item) =>
                item.platform,
            ),
        },
      }),
    ),

    pagination: {
      page:
        safePage,

      limit:
        safeLimit,

      total,

      totalPages,

      hasMore:
        safePage <
        totalPages,
    },
  };
}

async findReviews(
  username: string,
  page = 1,
  limit = 6,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  const safePage =
    Math.max(page, 1);

  const safeLimit =
    Math.min(
      Math.max(limit, 1),
      30,
    );

  const where = {
    userId: user.id,
    isHidden: false,
  };

  const [
    reviews,
    total,
  ] = await Promise.all([
    this.prisma.review.findMany({
      where,

      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },

        _count: {
          select: {
            likes: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip:
        (safePage - 1) *
        safeLimit,

      take:
        safeLimit,
    }),

    this.prisma.review.count({
      where,
    }),
  ]);

  const totalPages =
    Math.ceil(
      total / safeLimit,
    );

  return {
    items: reviews.map(
      (review) => ({
        id:
          review.id,

        body:
          review.body,

        isSpoiler:
          review.isSpoiler,

        createdAt:
          review.createdAt,

        likes:
          review._count.likes,

        game: {
          id:
            review.game.id,

          title:
            review.game.title,

          slug:
            review.game.slug,

          coverUrl:
            review.game.coverUrl,
        },
      }),
    ),

    pagination: {
      page:
        safePage,

      limit:
        safeLimit,

      total,

      totalPages,

      hasMore:
        safePage <
        totalPages,
    },
  };
}

async findRecommendations(
  username: string,
  page = 1,
  limit = 6,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  const safePage =
    Math.max(page, 1);

  const safeLimit =
    Math.min(
      Math.max(limit, 1),
      30,
    );

  const [
    recommendations,
    total,
  ] = await Promise.all([
    this.prisma.gameRecommendation.findMany({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
        body: true,
        createdAt: true,

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

        aspects: {
          select: {
            id: true,
            type: true,
          },
        },

        _count: {
          select: {
            supports: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip:
        (safePage - 1) *
        safeLimit,

      take:
        safeLimit,
    }),

    this.prisma.gameRecommendation.count({
      where: {
        userId: user.id,
      },
    }),
  ]);

  const totalPages =
    Math.ceil(
      total / safeLimit,
    );

  return {
    items:
      recommendations.map(
        (recommendation) => ({
          id:
            recommendation.id,

          body:
            recommendation.body,

          createdAt:
            recommendation.createdAt,

          sourceGame:
            recommendation.sourceGame,

          recommendedGame:
            recommendation.recommendedGame,

          aspects:
            recommendation.aspects,

          supportCount:
            recommendation._count
              .supports,
        }),
      ),

    pagination: {
      page:
        safePage,

      limit:
        safeLimit,

      total,

      totalPages,

      hasMore:
        safePage <
        totalPages,
    },
  };
}

  async followUser(
  currentUserId: string,
  username: string,
) {
  const targetUser =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
      },
    });

  if (
    !targetUser ||
    !targetUser.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  if (
    targetUser.id ===
    currentUserId
  ) {
    throw new BadRequestException(
    "Você não pode seguir a si mesmo.",
    );
  }

  await this.prisma.userFollow.upsert({
    where: {
      followerId_followingId: {
        followerId:
          currentUserId,

        followingId:
          targetUser.id,
      },
    },

    update: {},

    create: {
      followerId:
        currentUserId,

      followingId:
        targetUser.id,
    },
  });

  return {
    following: true,
  };
}

async unfollowUser(
  currentUserId: string,
  username: string,
) {
  const targetUser =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
      },
    });

  if (!targetUser) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  await this.prisma.userFollow.deleteMany({
    where: {
      followerId:
        currentUserId,

      followingId:
        targetUser.id,
    },
  });

  return {
    following: false,
  };
}

async getFollowStatus(
  currentUserId: string,
  username: string,
) {
  const targetUser =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
      },
    });

  if (!targetUser) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  const follow =
    await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId:
            currentUserId,

          followingId:
            targetUser.id,
        },
      },
    });

  return {
    following:
      Boolean(follow),

    isOwnProfile:
      currentUserId ===
      targetUser.id,
  };
}

async getFollowers(
  username: string,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  const followers =
    await this.prisma.userFollow.findMany({
      where: {
        followingId: user.id,
      },

      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            isProfilePublic: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return followers
    .filter(
      (item) =>
        item.follower
          .isProfilePublic,
    )
    .map((item) => ({
      id:
        item.follower.id,

      username:
        item.follower.username,

      displayName:
        item.follower.displayName,

      avatarUrl:
        item.follower.avatarUrl,

      bio:
        item.follower.bio,
    }));
}

async getFollowing(
  username: string,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  const following =
    await this.prisma.userFollow.findMany({
      where: {
        followerId: user.id,
      },

      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            isProfilePublic: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return following
    .filter(
      (item) =>
        item.following
          .isProfilePublic,
    )
    .map((item) => ({
      id:
        item.following.id,

      username:
        item.following.username,

      displayName:
        item.following.displayName,

      avatarUrl:
        item.following.avatarUrl,

      bio:
        item.following.bio,
    }));
}

async findActivity(
  username: string,
) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        username,
      },

      select: {
        id: true,
        isProfilePublic: true,
        isLibraryPublic: true,
      },
    });

  if (
    !user ||
    !user.isProfilePublic
  ) {
    throw new NotFoundException(
      "Usuário não encontrado.",
    );
  }

  const allowedActivities = [
    {
      type:
        ActivityType.REVIEW_CREATED,

      review: {
        is: {
          isHidden: false,
        },
      },
    },

    {
      type: {
        in: [
          ActivityType.RATING_CREATED,
          ActivityType.RATING_UPDATED,
        ],
      },
    },

    {
      type:
        ActivityType.RECOMMENDATION_CREATED,
    },

    ...(user.isLibraryPublic
      ? [
          {
            type: {
              in: [
                ActivityType.LIBRARY_ADDED,
                ActivityType.LIBRARY_STATUS_CHANGED,
              ],
            },
          },
        ]
      : []),
  ];

  const activities =
    await this.prisma.activity.findMany({
      where: {
        userId: user.id,

        OR:
          allowedActivities,
      },

      select: {
        id: true,
        type: true,
        status: true,
        ratingScore: true,
        createdAt: true,

        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },

        review: {
          select: {
            id: true,
            body: true,
            isSpoiler: true,

            _count: {
              select: {
                likes: true,
              },
            },
          },
        },

        recommendation: {
          select: {
            id: true,
            body: true,

            recommendedGame: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
              },
            },

            aspects: {
              select: {
                id: true,
                type: true,
              },
            },

            _count: {
              select: {
                supports: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 8,
    });

  return activities
    .map((activity) => {
      if (
        activity.type ===
          ActivityType.REVIEW_CREATED &&
        activity.review &&
        activity.game
      ) {
        return {
          id: activity.id,

          type:
            "REVIEW" as const,

          activityType:
            activity.type,

          createdAt:
            activity.createdAt,

          game:
            activity.game,

          review: {
            id:
              activity.review.id,

            body:
              activity.review.body,

            isSpoiler:
              activity.review
                .isSpoiler,

            likes:
              activity.review
                ._count.likes,
          },
        };
      }

      if (
        activity.type ===
          ActivityType.RECOMMENDATION_CREATED &&
        activity.recommendation &&
        activity.game
      ) {
        return {
          id: activity.id,

          type:
            "RECOMMENDATION" as const,

          activityType:
            activity.type,

          createdAt:
            activity.createdAt,

          game:
            activity.game,

          recommendation: {
            id:
              activity
                .recommendation.id,

            body:
              activity
                .recommendation.body,

            recommendedGame:
              activity
                .recommendation
                .recommendedGame,

            aspects:
              activity
                .recommendation
                .aspects,

            supportCount:
              activity
                .recommendation
                ._count.supports,
          },
        };
      }

      if (
        (
          activity.type ===
            ActivityType.LIBRARY_ADDED ||
          activity.type ===
            ActivityType.LIBRARY_STATUS_CHANGED
        ) &&
        activity.game &&
        activity.status
      ) {
        return {
          id: activity.id,

          type:
            "LIBRARY" as const,

          activityType:
            activity.type,

          createdAt:
            activity.createdAt,

          game:
            activity.game,

          library: {
            status:
              activity.status,
          },
        };
      }

      if (
        (
          activity.type ===
            ActivityType.RATING_CREATED ||
          activity.type ===
            ActivityType.RATING_UPDATED
        ) &&
        activity.game &&
        activity.ratingScore !== null
      ) {
        return {
          id: activity.id,

          type:
            "RATING" as const,

          activityType:
            activity.type,

          createdAt:
            activity.createdAt,

          game:
            activity.game,

          rating: {
            score:
              activity.ratingScore,
          },
        };
      }

      return null;
    })
    .filter(
      (activity) =>
        activity !== null,
    );
}

async getFeed(
  currentUserId: string,
  page = 1,
  limit = 10,
) {
  const safePage =
    Math.max(page, 1);

  const safeLimit =
    Math.min(
      Math.max(limit, 1),
      30,
    );

  const following =
    await this.prisma.userFollow.findMany({
      where: {
        followerId:
          currentUserId,
      },

      select: {
        followingId: true,
      },
    });

  const followingIds =
    following.map(
      (item) =>
        item.followingId,
    );

  if (
    followingIds.length === 0
  ) {
    return {
      items: [],

      pagination: {
        page: safePage,
        limit: safeLimit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

const where = {
  userId: {
    in: followingIds,
  },

  user: {
    isProfilePublic: true,
  },

  OR: [
    {
      type:
        ActivityType.REVIEW_CREATED,

      review: {
        is: {
          isHidden: false,
        },
      },
    },

    {
      type: {
        in: [
          ActivityType.LIBRARY_ADDED,
          ActivityType.LIBRARY_STATUS_CHANGED,
        ],
      },

      user: {
        isProfilePublic: true,
        isLibraryPublic: true,
      },
    },

    {
      type: {
        in: [
          ActivityType.RATING_CREATED,
          ActivityType.RATING_UPDATED,
        ],
      },
    },

    {
      type:
        ActivityType.RECOMMENDATION_CREATED,
      user: {
        isProfilePublic: true,
      },
    },
  ],
};

  const [
    activities,
    total,
  ] = await Promise.all([
    this.prisma.activity.findMany({
      where,

      select: {
        id: true,
        type: true,
        status: true,
        ratingScore: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },

        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },

        review: {
          select: {
            id: true,
            body: true,
            isSpoiler: true,

            _count: {
              select: {
                likes: true,
              },
            },
          },
        },

        recommendation: {
          select: {
            id: true,
            body: true,

            recommendedGame: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
              },
            },

            aspects: {
              select: {
                id: true,
                type: true,
              },
            },

            _count: {
              select: {
                supports: true,
              },
            },
          },
        },
      },

      

      orderBy: {
        createdAt: "desc",
      },

      skip:
        (safePage - 1) *
        safeLimit,

      take:
        safeLimit,
    }),

    this.prisma.activity.count({
      where,
    }),
  ]);

  const items =
    activities
      .map(
        (activity) => {
          if (
              activity.type ===
              ActivityType.REVIEW_CREATED
            ) {
            if (
              !activity.review ||
              !activity.game
            ) {
              return null;
            }

            return {
              id:
                activity.id,

              type:
                "REVIEW" as const,

              activityType:
                activity.type,

              createdAt:
                activity.createdAt,

              user:
                activity.user,

              game:
                activity.game,

              review: {
                id:
                  activity.review.id,

                body:
                  activity.review.body,

                isSpoiler:
                  activity.review
                    .isSpoiler,

                likes:
                  activity.review
                    ._count.likes,
              },
            };
          }

          if (
            activity.type ===
              ActivityType.RECOMMENDATION_CREATED &&
            activity.recommendation
          ) {
            return {
              id:
                activity.id,

              type:
                'RECOMMENDATION',

              activityType:
                activity.type,

              createdAt:
                activity.createdAt,

              user:
                activity.user,

              game:
                activity.game,

              recommendation: {
                id:
                  activity
                    .recommendation
                    .id,

                body:
                  activity
                    .recommendation
                    .body,

                recommendedGame:
                  activity
                    .recommendation
                    .recommendedGame,

                aspects:
                  activity
                    .recommendation
                    .aspects,

                supportCount:
                  activity
                    .recommendation
                    ._count
                    .supports,
              },
            };
          }

          if (
              activity.type ===
                ActivityType.LIBRARY_ADDED ||
              activity.type ===
                ActivityType.LIBRARY_STATUS_CHANGED
            ){
            if (
              !activity.game ||
              !activity.status
            ) {
              return null;
            }

            return {
              id:
                activity.id,

              type:
                "LIBRARY" as const,

              activityType:
                activity.type,

              createdAt:
                activity.createdAt,

              user:
                activity.user,

              game:
                activity.game,

              library: {
                status:
                  activity.status,
              },
            };
          }

          if (
  activity.type ===
    ActivityType.RATING_CREATED ||
  activity.type ===
    ActivityType.RATING_UPDATED
) {
  if (
    !activity.game ||
    activity.ratingScore === null
  ) {
    return null;
  }

    return {
      id: activity.id,

      type:
        "RATING" as const,

      activityType:
        activity.type,

      createdAt:
        activity.createdAt,

      user:
        activity.user,

      game:
        activity.game,

      rating: {
        score:
          activity.ratingScore,
      },
    };
  }

          return null;
        },
      )
      .filter(
        (item) =>
          item !== null,
      );

  const totalPages =
    Math.ceil(
      total / safeLimit,
    );

  return {
    items,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,

      hasMore:
        safePage <
        totalPages,
    },
  };
}

}