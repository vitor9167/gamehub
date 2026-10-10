import Header from "../../../components/Header";
import GameCard from "../../../components/GameCard";
import FollowButton from "../../../components/FollowButton";
import ProfileFavoriteButton from "../../../components/ProfileFavoriteButton";


type PlayingGame = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  releaseDate: string | null;

  genres: {
    id: number;
    name: string;
  }[];
};

type PublicUser = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  isLibraryPublic: boolean;

  stats: {
    games: number;
    completed: number;
    reviews: number;
    ratings: number;
    recommendations: number;
    followers: number;
    following: number;
  };

  playingNow: PlayingGame[];
  favorites: PlayingGame[];
};

type LibraryGame = {
  id: string;

  status:
    | "WANT_TO_PLAY"
    | "PLAYING"
    | "COMPLETED"
    | "DROPPED"
    | "PAUSED"
    | "IN_LIBRARY";

    isFavorite: boolean;

  game: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverUrl: string | null;
    releaseDate: string | null;

    genres: {
      id: number;
      name: string;
    }[];

    platforms: {
      id: number;
      name: string;
    }[];
  };
};

type PublicLibraryResponse = {
  isPrivate: boolean;
  items: LibraryGame[];

   pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

type PublicReview = {
  id: string;
  body: string;
  isSpoiler: boolean;
  createdAt: string;
  likes: number;

  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };
};

type PublicReviewsResponse = {
  items: PublicReview[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

type RecommendationAspectType =
  | "STORY"
  | "GAMEPLAY"
  | "MECHANICS"
  | "ATMOSPHERE"
  | "EXPLORATION"
  | "PROGRESSION"
  | "DIFFICULTY"
  | "MULTIPLAYER"
  | "ART_STYLE"
  | "SOUNDTRACK";

type PublicRecommendation = {
  id: string;
  body: string;
  createdAt: string;

  sourceGame: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };

  recommendedGame: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };

  aspects: {
    id: string;
    type: RecommendationAspectType;
  }[];

  supportCount: number;
};

type PublicRecommendationsResponse = {
  items: PublicRecommendation[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

type UserPageProps = {
  params: Promise<{
    username: string;
  }>;

  searchParams: Promise<{
    tab?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: string;
    reviewPage?: string;
    recommendationPage?: string;
  }>;
};

const statusLabels = {
  WANT_TO_PLAY: "Quero jogar",
  PLAYING: "Jogando",
  COMPLETED: "Concluído",
  DROPPED: "Abandonado",
  PAUSED: "Pausado",
  IN_LIBRARY: "Na biblioteca",
};

const recommendationAspectLabels: Record<
  RecommendationAspectType,
  string
> = {
  STORY: "História",
  GAMEPLAY: "Gameplay",
  MECHANICS: "Mecânicas",
  ATMOSPHERE: "Atmosfera",
  EXPLORATION: "Exploração",
  PROGRESSION: "Progressão",
  DIFFICULTY: "Dificuldade",
  MULTIPLAYER: "Multiplayer",
  ART_STYLE: "Direção de arte",
  SOUNDTRACK: "Trilha sonora",
};

type ActivityGame = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

type ProfileActivity =
  | {
      id: string;
      type: "LIBRARY";
      activityType:
        | "LIBRARY_ADDED"
        | "LIBRARY_STATUS_CHANGED";
      createdAt: string;
      game: ActivityGame;
      library: {
        status:
          | "WANT_TO_PLAY"
          | "PLAYING"
          | "COMPLETED"
          | "DROPPED"
          | "PAUSED"
          | "IN_LIBRARY";
      };
    }
  | {
      id: string;
      type: "RATING";
      activityType:
        | "RATING_CREATED"
        | "RATING_UPDATED";
      createdAt: string;
      game: ActivityGame;
      rating: {
        score: number;
      };
    }
  | {
      id: string;
      type: "REVIEW";
      activityType: "REVIEW_CREATED";
      createdAt: string;
      game: ActivityGame;
      review: {
        id: string;
        body: string;
        isSpoiler: boolean;
        likes: number;
      };
    }
  | {
      id: string;
      type: "RECOMMENDATION";
      activityType: "RECOMMENDATION_CREATED";
      createdAt: string;
      game: ActivityGame;
      recommendation: {
        id: string;
        body: string;

        recommendedGame: {
          id: string;
          title: string;
          slug: string;
          coverUrl: string | null;
        };

        aspects: {
          id: string;
          type: RecommendationAspectType;
        }[];

        supportCount: number;
      };
    };

async function getUser(
  username: string,
): Promise<PublicUser> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Usuário não encontrado.",
    );
  }

  return response.json();
}

async function getUserLibrary(
  username: string,
  options: {
    page: number;
    status?: string;
    search?: string;
    sort?: string;
  },
): Promise<PublicLibraryResponse> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(options.page),
  );

  params.set(
    "limit",
    "12",
  );

  if (options.status) {
    params.set(
      "status",
      options.status,
    );
  }

  if (options.search) {
    params.set(
      "search",
      options.search,
    );
  }

  if (options.sort) {
    params.set(
      "sort",
      options.sort,
    );
  }

  const response = await fetch(
    `${API_URL}/users/${username}/library?${params.toString()}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      isPrivate: false,
      items: [],

      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  return response.json();
}

async function getUserReviews(
  username: string,
  page: number,
): Promise<PublicReviewsResponse> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/reviews?page=${page}&limit=6`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      items: [],

      pagination: {
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  return response.json();
}

async function getUserRecommendations(
  username: string,
  page: number,
): Promise<PublicRecommendationsResponse> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/recommendations?page=${page}&limit=6`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      items: [],

      pagination: {
        page: 1,
        limit: 6,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  return response.json();
}

async function getFeaturedReviews(
  username: string,
): Promise<PublicReview[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/reviews?page=1&limit=2`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const data: PublicReviewsResponse =
    await response.json();

  return data.items;
}

async function getUserActivity(
  username: string,
): Promise<ProfileActivity[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/activity`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

async function getFeaturedRecommendations(
  username: string,
): Promise<PublicRecommendation[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/recommendations?page=1&limit=2`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const data: PublicRecommendationsResponse =
    await response.json();

  return data.items;
}

export default async function UserPage({
  params,
  searchParams,
}: UserPageProps) {
  const { username } = await params;
  const { tab, status, search, sort, page, reviewPage, recommendationPage,} = await searchParams;
  const currentReviewPage =
  Math.max(
    Number(reviewPage) || 1,
    1,
  );
  const currentLibraryPage =
  Math.max(
    Number(page) || 1,
    1,
  );

  const currentRecommendationPage =
  Math.max(
    Number(recommendationPage) || 1,
    1,
  );

  const activeTab =
  tab === "library"
    ? "library"
    : tab === "reviews"
      ? "reviews"
      : tab === "recommendations"
        ? "recommendations"
        : "overview";

const [
  user,
  libraryResponse,
  reviewsResponse,
  recommendationsResponse,
  featuredReviews,
  featuredRecommendations,
  activities,
] = await Promise.all([
  getUser(username),

  getUserLibrary(
    username,
    {
      page: currentLibraryPage,
      status: status || undefined,
      search: search || undefined,
      sort: sort || undefined,
    },
  ),

  getUserReviews(
    username,
    currentReviewPage,
  ),

  getUserRecommendations(
    username,
    currentRecommendationPage,
  ),

  getFeaturedReviews(
    username,
  ),

  getFeaturedRecommendations(
    username,
  ),

  getUserActivity(
    username,
  ),
]);
const reviews =
  reviewsResponse.items;

const recommendations =
  recommendationsResponse.items;

const validLibraryStatuses = [
  "WANT_TO_PLAY",
  "PLAYING",
  "COMPLETED",
  "DROPPED",
  "PAUSED",
  "IN_LIBRARY",
] as const;

type LibraryStatusFilter =
  | "ALL"
  | (typeof validLibraryStatuses)[number];

const activeLibraryStatus: LibraryStatusFilter =
  validLibraryStatuses.includes(
    status as (typeof validLibraryStatuses)[number],
  )
    ? (status as LibraryStatusFilter)
    : "ALL";


const activeSort =
  sort === "title" ||
  sort === "release"
    ? sort
    : "recent";

const library =
  libraryResponse.items;

const libraryStatusCounts = {
  ALL: library.length,

  WANT_TO_PLAY:
    library.filter(
      (entry) =>
        entry.status ===
        "WANT_TO_PLAY",
    ).length,

  PLAYING:
    library.filter(
      (entry) =>
        entry.status ===
        "PLAYING",
    ).length,

  COMPLETED:
    library.filter(
      (entry) =>
        entry.status ===
        "COMPLETED",
    ).length,

  PAUSED:
    library.filter(
      (entry) =>
        entry.status ===
        "PAUSED",
    ).length,

  DROPPED:
    library.filter(
      (entry) =>
        entry.status ===
        "DROPPED",
    ).length,

  IN_LIBRARY:
    library.filter(
      (entry) =>
        entry.status ===
        "IN_LIBRARY",
    ).length,
};

function buildReviewUrl(
  targetPage: number,
) {
  const params =
    new URLSearchParams();

  params.set(
    "tab",
    "reviews",
  );

  params.set(
    "reviewPage",
    String(targetPage),
  );

  return `/users/${user.username}?${params.toString()}`;
}

function buildRecommendationUrl(
  targetPage: number,
) {
  const params =
    new URLSearchParams();

  params.set(
    "tab",
    "recommendations",
  );

  params.set(
    "recommendationPage",
    String(targetPage),
  );

  return `/users/${user.username}?${params.toString()}`;
}

function buildLibraryUrl(
  targetPage: number,
) {
  const params =
    new URLSearchParams();

  params.set(
    "tab",
    "library",
  );

  params.set(
    "page",
    String(targetPage),
  );

  if (
    status &&
    status !== "ALL"
  ) {
    params.set(
      "status",
      status,
    );
  }

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  if (
    sort &&
    sort !== "recent"
  ) {
    params.set(
      "sort",
      sort,
    );
  }

  return `/users/${user.username}?${params.toString()}`;
}

function getPaginationItems(
  currentPage: number,
  totalPages: number,
) {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const pages: (number | "...")[] = [1];

  const start = Math.max(
    2,
    currentPage - 2,
  );

  const end = Math.min(
    totalPages - 1,
    currentPage + 2,
  );

  if (start > 2) {
    pages.push("...");
  }

  for (
    let pageNumber = start;
    pageNumber <= end;
    pageNumber++
  ) {
    pages.push(pageNumber);
  }

  if (end < totalPages - 1) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

  return (
    <main>
      <Header />

      <section className="public-profile-page">
        <div className="public-profile-header">
          <div className="public-profile-main">
            {user.avatarUrl ? (
              <img
                src={
                  user.avatarUrl
                }
                alt={`Avatar de ${user.username}`}
                className="public-profile-avatar"
              />
            ) : (
              <div className="public-profile-avatar-placeholder">
                {(user.displayName ||
                  user.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="public-profile-identity">
              <h1>
                {user.displayName ||
                  user.username}
              </h1>

              <span>
                @{user.username}
              </span>

              {user.bio && (
                <p>
                  {user.bio}
                </p>
              )}

              <small>
                Membro desde{" "}
                {new Date(
                  user.createdAt,
                ).toLocaleDateString(
                  "pt-BR",
                )}
              </small>

              <FollowButton
                username={
                  user.username
                }
                initialFollowers={
                  user.stats
                    .followers
                }
              />
            </div>
          </div>

          <div className="public-profile-stats-inline">
          <div className="public-profile-stat">
            <strong>
              {user.stats.games}
            </strong>

            <span>Jogos</span>
          </div>

          <div className="public-profile-stat">
            <strong>
              {user.stats.completed}
            </strong>

            <span>Concluídos</span>
          </div>

          <div className="public-profile-stat">
            <strong>
              {user.stats.reviews}
            </strong>

            <span>Reviews</span>
          </div>

          <div className="public-profile-stat">
            <strong>
              {user.stats.ratings}
            </strong>

            <span>Avaliações</span>
          </div>

          <div className="public-profile-stat">
            <strong>
              {user.stats.recommendations}
            </strong>

            <span>Recomendações</span>
          </div>

          <a
            href={`/users/${user.username}/followers`}
            className="public-profile-stat"
          >
            <strong>
              {user.stats.followers}
            </strong>

            <span>Seguidores</span>
          </a>

          <a
            href={`/users/${user.username}/following`}
            className="public-profile-stat"
          >
            <strong>
              {user.stats.following}
            </strong>

            <span>Seguindo</span>
          </a>
        </div>

        </div>

        <nav className="public-profile-tabs">
          <a
  href={`/users/${user.username}`}
  className={
    activeTab === "overview"
      ? "public-profile-tab active"
      : "public-profile-tab"
  }
>
  Visão geral
            </a>

            <a
              href={`/users/${user.username}?tab=library`}
              className={
                activeTab === "library"
                  ? "public-profile-tab active"
                  : "public-profile-tab"
              }
            >
              Biblioteca
              <span className="public-profile-tab-count">
                {user.stats.games}
              </span>
            </a>

            <a
              href={`/users/${user.username}?tab=reviews`}
              className={
                activeTab === "reviews"
                  ? "public-profile-tab active"
                  : "public-profile-tab"
              }
            >
              Reviews
              <span className="public-profile-tab-count">
                {user.stats.reviews}
              </span>
            </a>

            <a
              href={`/users/${user.username}?tab=recommendations`}
              className={
                activeTab === "recommendations"
                  ? "public-profile-tab active"
                  : "public-profile-tab"
              }
            >
              Recomendações
              <span className="public-profile-tab-count">
                {user.stats.recommendations}
              </span>
            </a>

        </nav>
{activeTab === "overview" && (
  <>
    <div className="public-overview-grid">
      {!libraryResponse.isPrivate &&
        user.playingNow.length > 0 && (
          <div className="public-overview-panel">
            <div className="public-profile-section-header">
              <div>
                <span className="public-profile-section-eyebrow">
                  Agora
                </span>

                <h2>Jogando agora</h2>

                <p>
                  Jogos que{" "}
                  {user.displayName ||
                    user.username}{" "}
                  está jogando no momento.
                </p>
              </div>
            </div>

            <div className="public-playing-grid">
              {user.playingNow.map(
                (game) => (
                  <a
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="public-playing-card"
                  >
                    <div className="public-playing-cover">
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt={`Capa de ${game.title}`}
                        />
                      ) : (
                        <div className="public-playing-no-cover">
                          Sem capa
                        </div>
                      )}

                      <span className="public-playing-badge">
                        Jogando
                      </span>
                    </div>

                    <div className="public-playing-info">
                      <strong>
                        {game.title}
                      </strong>

                      {game.genres.length >
                        0 && (
                        <span>
                          {game.genres
                            .slice(0, 2)
                            .map(
                              (genre) =>
                                genre.name,
                            )
                            .join(" • ")}
                        </span>
                      )}
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>
        )}

      {!libraryResponse.isPrivate &&
        user.favorites.length > 0 && (
          <div className="public-overview-panel">
            <div className="public-profile-section-header">
              <div>
                <span className="public-profile-section-eyebrow">
                  Destaques
                </span>

                <h2>Favoritos</h2>

                <p>
                  Jogos favoritos de{" "}
                  {user.displayName ||
                    user.username}.
                </p>
              </div>
            </div>

            <div className="public-favorites-grid">
              {user.favorites.map(
                (game) => (
                  <a
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="public-favorite-card"
                  >
                    <div className="public-favorite-cover">
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt={`Capa de ${game.title}`}
                        />
                      ) : (
                        <div className="public-favorite-no-cover">
                          Sem capa
                        </div>
                      )}

                      <span className="public-favorite-heart">
                        ♥
                      </span>
                    </div>

                    <div className="public-favorite-info">
                      <strong>
                        {game.title}
                      </strong>

                      {game.genres.length >
                        0 && (
                        <span>
                          {game.genres
                            .slice(0, 2)
                            .map(
                              (genre) =>
                                genre.name,
                            )
                            .join(" • ")}
                        </span>
                      )}
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>
        )}
    </div>
    
{activities.length > 0 && (
  <div className="public-profile-section public-activity-section">
    <div className="public-profile-section-header">
      <div>
        <span className="public-profile-section-eyebrow">
          Histórico
        </span>

        <h2>Atividade recente</h2>

        <p>
          Últimas atividades de{" "}
          {user.displayName ||
            user.username}.
        </p>
      </div>
    </div>

    <div className="public-activity-grid">
      {activities.map((activity) => (
        <article
          key={activity.id}
          className={`public-activity-card public-activity-${activity.type.toLowerCase()}`}
        >
          <div className="public-activity-card-top">
            {activity.game.coverUrl ? (
              <a
                href={`/games/${activity.game.slug}`}
                className="public-activity-cover"
              >
                <img
                  src={activity.game.coverUrl}
                  alt={`Capa de ${activity.game.title}`}
                />
              </a>
            ) : (
              <div className="public-activity-cover public-activity-no-cover">
                Sem capa
              </div>
            )}

            <div className="public-activity-main">
              <div className="public-activity-type-row">
                <span className="public-activity-type">
                  {activity.type === "LIBRARY"
                    ? "Biblioteca"
                    : activity.type === "RATING"
                      ? "Avaliação"
                      : activity.type === "REVIEW"
                        ? "Review"
                        : "Recomendação"}
                </span>

                <time className="public-activity-date">
                  {new Date(
                    activity.createdAt,
                  ).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )}
                </time>
              </div>

              {activity.type === "LIBRARY" ? (
                <>
                  <p className="public-activity-text">
                    {activity.activityType ===
                    "LIBRARY_ADDED"
                      ? "Adicionou"
                      : "Atualizou"}{" "}
                    <a
                      href={`/games/${activity.game.slug}`}
                    >
                      {activity.game.title}
                    </a>{" "}
                    na biblioteca.
                  </p>

                  <span className="public-activity-badge">
                    {
                      statusLabels[
                        activity.library.status
                      ]
                    }
                  </span>
                </>
              ) : activity.type === "RATING" ? (
                <p className="public-activity-text">
                  {activity.activityType ===
                  "RATING_CREATED"
                    ? "Avaliou"
                    : "Atualizou a avaliação de"}{" "}
                  <a
                    href={`/games/${activity.game.slug}`}
                  >
                    {activity.game.title}
                  </a>{" "}
                  com{" "}
                  <strong>
                    {activity.rating.score}/10
                  </strong>
                </p>
              ) : activity.type === "REVIEW" ? (
                <>
                  <p className="public-activity-text">
                    Publicou uma review de{" "}
                    <a
                      href={`/games/${activity.game.slug}`}
                    >
                      {activity.game.title}
                    </a>
                  </p>

                  {!activity.review.isSpoiler ? (
                    <p className="public-activity-preview">
                      {activity.review.body}
                    </p>
                  ) : (
                    <span className="public-activity-spoiler">
                      Review com spoiler
                    </span>
                  )}
                </>
              ) : (
                <>
                  <p className="public-activity-text">
                    Recomendou{" "}
                    <a
                      href={`/games/${activity.recommendation.recommendedGame.slug}`}
                    >
                      {
                        activity.recommendation
                          .recommendedGame.title
                      }
                    </a>{" "}
                    para quem gostou de{" "}
                    <a
                      href={`/games/${activity.game.slug}`}
                    >
                      {activity.game.title}
                    </a>
                  </p>

                  <div className="public-activity-aspects">
                    {activity.recommendation.aspects.map(
                      (aspect) => (
                        <span key={aspect.id}>
                          {
                            recommendationAspectLabels[
                              aspect.type
                            ]
                          }
                        </span>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
)}

{featuredReviews.length > 0 && (
  <div className="public-profile-section public-featured-reviews">
    <div className="public-profile-section-header public-profile-section-header-row">
      <div>
        <span className="public-profile-section-eyebrow">
          Opiniões
        </span>

        <h2>Reviews recentes</h2>

        <p>
          Últimas reviews publicadas por{" "}
          {user.displayName || user.username}.
        </p>
      </div>

      <a
        href={`/users/${user.username}?tab=reviews`}
        className="public-section-link"
      >
        Ver todas
      </a>
    </div>

    <div className="public-featured-reviews-grid">
      {featuredReviews.map(
        (review) => (
          <article
            key={review.id}
            className="public-featured-review-card"
          >
            <div className="public-featured-review-game">
              {review.game.coverUrl && (
                <a
                  href={`/games/${review.game.slug}`}
                  className="public-featured-review-cover"
                >
                  <img
                    src={review.game.coverUrl}
                    alt={`Capa de ${review.game.title}`}
                  />
                </a>
              )}

              <div>
                <a
                  href={`/games/${review.game.slug}`}
                  className="public-featured-review-title"
                >
                  {review.game.title}
                </a>

                <span>
                  {new Date(
                    review.createdAt,
                  ).toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              </div>
            </div>

            {review.isSpoiler ? (
              <span className="public-activity-spoiler">
                Review com spoiler
              </span>
            ) : (
              <p className="public-featured-review-body">
                {review.body}
              </p>
            )}

            <div className="public-featured-review-footer">
              {review.likes}{" "}
              {review.likes === 1
                ? "curtida"
                : "curtidas"}
            </div>
          </article>
        ),
      )}
    </div>
  </div>
)}

{featuredRecommendations.length > 0 && (
  <div className="public-profile-section public-featured-recommendations">
    <div className="public-profile-section-header public-profile-section-header-row">
      <div>
        <span className="public-profile-section-eyebrow">
          Descobertas
        </span>

        <h2>Recomendações em destaque</h2>

        <p>
          Algumas recomendações feitas por{" "}
          {user.displayName || user.username}.
        </p>
      </div>

      <a
        href={`/users/${user.username}?tab=recommendations`}
        className="public-section-link"
      >
        Ver todas
      </a>
    </div>

    <div className="public-featured-recommendations-grid">
      {featuredRecommendations.map(
        (recommendation) => (
          <article
            key={recommendation.id}
            className="public-featured-recommendation-card"
          >
            <div className="public-featured-recommendation-games">
              <a
                href={`/games/${recommendation.sourceGame.slug}`}
                className="public-featured-recommendation-game"
              >
                <div className="public-featured-recommendation-cover">
                  {recommendation.sourceGame.coverUrl ? (
                    <img
                      src={
                        recommendation.sourceGame.coverUrl
                      }
                      alt={`Capa de ${recommendation.sourceGame.title}`}
                    />
                  ) : (
                    <div className="public-featured-recommendation-no-cover">
                      Sem capa
                    </div>
                  )}
                </div>

                <div>
                  <span>
                    Se você gostou de
                  </span>

                  <strong>
                    {recommendation.sourceGame.title}
                  </strong>
                </div>
              </a>

              <span className="public-featured-recommendation-arrow">
                →
              </span>

              <a
                href={`/games/${recommendation.recommendedGame.slug}`}
                className="public-featured-recommendation-game"
              >
                <div className="public-featured-recommendation-cover">
                  {recommendation.recommendedGame.coverUrl ? (
                    <img
                      src={
                        recommendation.recommendedGame.coverUrl
                      }
                      alt={`Capa de ${recommendation.recommendedGame.title}`}
                    />
                  ) : (
                    <div className="public-featured-recommendation-no-cover">
                      Sem capa
                    </div>
                  )}
                </div>

                <div>
                  <span>
                    Experimente
                  </span>

                  <strong>
                    {recommendation.recommendedGame.title}
                  </strong>
                </div>
              </a>
            </div>

            {recommendation.aspects.length > 0 && (
              <div className="public-featured-recommendation-aspects">
                {recommendation.aspects
                  .slice(0, 3)
                  .map((aspect) => (
                    <span key={aspect.id}>
                      {
                        recommendationAspectLabels[
                          aspect.type
                        ]
                      }
                    </span>
                  ))}
              </div>
            )}

            <p className="public-featured-recommendation-body">
              {recommendation.body}
            </p>

            <div className="public-featured-recommendation-footer">
              <span>
                {recommendation.supportCount}{" "}
                {recommendation.supportCount === 1
                  ? "pessoa também recomenda"
                  : "pessoas também recomendam"}
              </span>

              <span>
                {new Date(
                  recommendation.createdAt,
                ).toLocaleDateString(
                  "pt-BR",
                )}
              </span>
            </div>
          </article>
        ))}
    </div>
  </div>
)}
  </>
)}
      {activeTab === "library" && (
        <div className="public-profile-section">
          <div className="public-profile-section-header">
            <div>
              <h2>
                Biblioteca
              </h2>

              {!libraryResponse.isPrivate &&
  library.length > 0 && (
    <div className="public-library-filters">
      <a
        href={`/users/${user.username}?tab=library`}
        className={
          activeLibraryStatus === "ALL"
            ? "public-library-filter active"
            : "public-library-filter"
        }
      >
        Todos
        <span>
          {libraryStatusCounts.ALL}
        </span>
      </a>

      <a
        href={`/users/${user.username}?tab=library&status=PLAYING`}
        className={
          activeLibraryStatus ===
          "PLAYING"
            ? "public-library-filter active"
            : "public-library-filter"
        }
      >
        Jogando
        <span>
          {
            libraryStatusCounts
              .PLAYING
          }
        </span>
      </a>

      <a
        href={`/users/${user.username}?tab=library&status=COMPLETED`}
        className={
          activeLibraryStatus ===
          "COMPLETED"
            ? "public-library-filter active"
            : "public-library-filter"
        }
      >
        Concluídos
        <span>
          {
            libraryStatusCounts
              .COMPLETED
          }
        </span>
      </a>

      <a
        href={`/users/${user.username}?tab=library&status=WANT_TO_PLAY`}
        className={
          activeLibraryStatus ===
          "WANT_TO_PLAY"
            ? "public-library-filter active"
            : "public-library-filter"
        }
      >
        Quero jogar
        <span>
          {
            libraryStatusCounts
              .WANT_TO_PLAY
          }
        </span>
      </a>

      <a
        href={`/users/${user.username}?tab=library&status=PAUSED`}
        className={
          activeLibraryStatus ===
          "PAUSED"
            ? "public-library-filter active"
            : "public-library-filter"
        }
      >
        Pausados
        <span>
          {
            libraryStatusCounts
              .PAUSED
          }
        </span>
      </a>

      <a
        href={`/users/${user.username}?tab=library&status=DROPPED`}
        className={
          activeLibraryStatus ===
          "DROPPED"
            ? "public-library-filter active"
            : "public-library-filter"
        }
      >
        Abandonados
        <span>
          {
            libraryStatusCounts
              .DROPPED
          }
        </span>
      </a>

      <form
  method="GET"
  className="public-library-toolbar"
>
  <input
    type="hidden"
    name="tab"
    value="library"
  />

  {activeLibraryStatus !== "ALL" && (
    <input
      type="hidden"
      name="status"
      value={activeLibraryStatus}
    />
  )}

  <div className="public-library-search">
    <input
      type="text"
      name="search"
      defaultValue={search ?? ""}
      placeholder="Buscar na biblioteca..."
    />

    <button type="submit">
      Buscar
    </button>
  </div>

  <select
    name="sort"
    defaultValue={activeSort}
  >
    <option value="recent">
      Mais recentes
    </option>

    <option value="title">
      Título A–Z
    </option>

    <option value="release">
      Lançamento
    </option>
  </select>

  <button
    type="submit"
    className="public-library-apply"
  >
    Aplicar
  </button>

  {(search ||
    activeLibraryStatus !== "ALL" ||
    activeSort !== "recent") && (
    <a
      href={`/users/${user.username}?tab=library`}
      className="public-library-clear"
    >
      Limpar
    </a>
  )}
</form>
    </div>

    
  )}

              <p>
                Jogos adicionados
                por{" "}
                {user.displayName ||
                  user.username}
                .
              </p>
            </div>
          </div>

{libraryResponse.isPrivate ? (
  <div className="empty-state">
    A biblioteca deste usuário é privada.
  </div>
) : libraryResponse.pagination.total === 0 ? (
  <div className="empty-state">
    Nenhum jogo encontrado com os
    filtros atuais.
  </div>
) : (
  <>
    <div className="public-library-grid">
      {library.map((entry) => (
        <div
          key={entry.id}
          className="public-library-item"
        >
          <GameCard
            game={entry.game}
          />

          <div className="public-library-actions">
            <span className="public-library-status">
              {statusLabels[entry.status]}
            </span>

            <ProfileFavoriteButton
              profileUsername={user.username}
              gameId={entry.game.id}
              initialFavorite={entry.isFavorite}
            />
          </div>
        </div>
      ))}
    </div>

    {libraryResponse.pagination.totalPages > 1 && (
      <div className="public-library-pagination">
        {libraryResponse.pagination.page > 1 && (
          <a
            href={buildLibraryUrl(
              libraryResponse.pagination.page - 1,
            )}
            className="public-library-page-button"
          >
            ← Anterior
          </a>
        )}

        <div className="public-library-page-numbers">
          {getPaginationItems(
            libraryResponse.pagination.page,
            libraryResponse.pagination.totalPages,
          ).map((item, index) =>
            item === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="public-library-page-ellipsis"
              >
                …
              </span>
            ) : (
              <a
                key={item}
                href={buildLibraryUrl(item)}
                className={
                  item ===
                  libraryResponse.pagination.page
                    ? "public-library-page-number active"
                    : "public-library-page-number"
                }
              >
                {item}
              </a>
            ),
          )}
        </div>

        {libraryResponse.pagination.hasMore && (
          <a
            href={buildLibraryUrl(
              libraryResponse.pagination.page + 1,
            )}
            className="public-library-page-button"
          >
            Próxima →
          </a>
        )}
      </div>
    )}
  </>
)}


        </div>
        )}
{activeTab === "reviews" && (
  <div className="public-profile-section">
    <div className="public-profile-section-header">
      <div>
        <h2>
          Reviews recentes
        </h2>

        <p>
          Opiniões publicadas por{" "}
          {user.displayName ||
            user.username}
          .
        </p>
      </div>
    </div>

    {reviews.length > 0 ? (
      <>
        <div className="public-reviews-list">
          {reviews.map(
            (review) => (
              <article
                key={review.id}
                className="public-review-card"
              >
                <div className="public-review-game">
                  {review.game.coverUrl && (
                    <img
                      src={
                        review.game
                          .coverUrl
                      }
                      alt={`Capa de ${review.game.title}`}
                    />
                  )}

                  <div>
                    <a
                      href={`/games/${review.game.slug}`}
                    >
                      {
                        review.game
                          .title
                      }
                    </a>

                    <span>
                      {new Date(
                        review.createdAt,
                      ).toLocaleDateString(
                        "pt-BR",
                      )}
                    </span>
                  </div>
                </div>

                {review.isSpoiler ? (
                  <details>
                    <summary>
                      Review contém
                      spoiler
                    </summary>

                    <p>
                      {review.body}
                    </p>
                  </details>
                ) : (
                  <p>
                    {review.body}
                  </p>
                )}

                <div className="public-review-footer">
                  {review.likes}{" "}
                  {review.likes === 1
                    ? "curtida"
                    : "curtidas"}
                </div>
              </article>
            ),
          )}
        </div>

        {reviewsResponse.pagination
          .totalPages > 1 && (
          <div className="public-library-pagination">
            {reviewsResponse
              .pagination.page >
              1 && (
              <a
                href={buildReviewUrl(
                  reviewsResponse
                    .pagination.page -
                    1,
                )}
                className="public-library-page-button"
              >
                ← Anterior
              </a>
            )}

            <div className="public-library-page-numbers">
              {getPaginationItems(
                reviewsResponse
                  .pagination.page,

                reviewsResponse
                  .pagination
                  .totalPages,
              ).map(
                (item, index) =>
                  item === "..." ? (
                    <span
                      key={`review-ellipsis-${index}`}
                      className="public-library-page-ellipsis"
                    >
                      …
                    </span>
                  ) : (
                    <a
                      key={item}
                      href={buildReviewUrl(
                        item,
                      )}
                      className={
                        item ===
                        reviewsResponse
                          .pagination
                          .page
                          ? "public-library-page-number active"
                          : "public-library-page-number"
                      }
                    >
                      {item}
                    </a>
                  ),
              )}
            </div>

            {reviewsResponse
              .pagination
              .hasMore && (
              <a
                href={buildReviewUrl(
                  reviewsResponse
                    .pagination.page +
                    1,
                )}
                className="public-library-page-button"
              >
                Próxima →
              </a>
            )}
          </div>
        )}
      </>
    ) : (
      <div className="empty-state">
        Este usuário ainda não
        publicou reviews.
      </div>
    )}
  </div>
)}

        {activeTab === "recommendations" && (
  <div className="public-profile-section">
    <div className="public-profile-section-header">
      <div>
        <h2>Recomendações</h2>

        <p>
          Jogos recomendados por{" "}
          {user.displayName ||
            user.username}.
        </p>
      </div>
    </div>

    {recommendations.length > 0 ? (
      <div className="public-recommendations-list">
        {recommendations.map(
          (recommendation) => (
            <article
              key={recommendation.id}
              className="public-recommendation-card"
            >
              <div className="public-recommendation-games">
                <a
                  href={`/games/${recommendation.sourceGame.slug}`}
                  className="public-recommendation-game"
                >
                  <div className="public-recommendation-cover">
                    {recommendation.sourceGame
                      .coverUrl ? (
                      <img
                        src={
                          recommendation
                            .sourceGame
                            .coverUrl
                        }
                        alt={`Capa de ${recommendation.sourceGame.title}`}
                      />
                    ) : (
                      <div className="public-recommendation-no-cover">
                        Sem capa
                      </div>
                    )}
                  </div>

                  <div>
                    <span>
                      Se você gostou de
                    </span>

                    <strong>
                      {
                        recommendation
                          .sourceGame
                          .title
                      }
                    </strong>
                  </div>
                </a>

                <div className="public-recommendation-arrow">
                  →
                </div>

                <a
                  href={`/games/${recommendation.recommendedGame.slug}`}
                  className="public-recommendation-game"
                >
                  <div className="public-recommendation-cover">
                    {recommendation
                      .recommendedGame
                      .coverUrl ? (
                      <img
                        src={
                          recommendation
                            .recommendedGame
                            .coverUrl
                        }
                        alt={`Capa de ${recommendation.recommendedGame.title}`}
                      />
                    ) : (
                      <div className="public-recommendation-no-cover">
                        Sem capa
                      </div>
                    )}
                  </div>

                  <div>
                    <span>
                      Experimente
                    </span>

                    <strong>
                      {
                        recommendation
                          .recommendedGame
                          .title
                      }
                    </strong>
                  </div>
                </a>
              </div>

              {recommendation.aspects
                .length > 0 && (
                <div className="public-recommendation-aspects">
                  {recommendation.aspects.map(
                    (aspect) => (
                      <span
                        key={aspect.id}
                      >
                        {
                          recommendationAspectLabels[
                            aspect.type
                          ]
                        }
                      </span>
                    ),
                  )}
                </div>
              )}

              <p className="public-recommendation-body">
                {recommendation.body}
              </p>

              <div className="public-recommendation-footer">
                <span>
                  {
                    recommendation.supportCount
                  }{" "}
                  {recommendation.supportCount ===
                  1
                    ? "pessoa também recomenda"
                    : "pessoas também recomendam"}
                </span>

                <span>
                  {new Date(
                    recommendation.createdAt,
                  ).toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              </div>
            </article>
          ),
        )}

        {recommendationsResponse.pagination
  .totalPages > 1 && (
  <div className="public-library-pagination">
    {recommendationsResponse
      .pagination.page >
      1 && (
      <a
        href={buildRecommendationUrl(
          recommendationsResponse
            .pagination.page - 1,
        )}
        className="public-library-page-button"
      >
        ← Anterior
      </a>
    )}

    <div className="public-library-page-numbers">
      {getPaginationItems(
        recommendationsResponse
          .pagination.page,

        recommendationsResponse
          .pagination.totalPages,
      ).map(
        (item, index) =>
          item === "..." ? (
            <span
              key={`recommendation-ellipsis-${index}`}
              className="public-library-page-ellipsis"
            >
              …
            </span>
          ) : (
            <a
              key={item}
              href={buildRecommendationUrl(
                item,
              )}
              className={
                item ===
                recommendationsResponse
                  .pagination.page
                  ? "public-library-page-number active"
                  : "public-library-page-number"
              }
            >
              {item}
            </a>
          ),
      )}
    </div>

    {recommendationsResponse
      .pagination.hasMore && (
      <a
        href={buildRecommendationUrl(
          recommendationsResponse
            .pagination.page + 1,
        )}
        className="public-library-page-button"
      >
        Próxima →
      </a>
    )}
  </div>
)}
      </div>
    ) : (
      <div className="empty-state">
        Este usuário ainda não fez
        recomendações.
      </div>
    )}
  </div>
)}

      </section>
    </main>
  );
}