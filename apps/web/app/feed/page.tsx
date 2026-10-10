"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { apiJson } from "../../lib/api";

type FeedUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type FeedGame = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

type ReviewActivity = {
  id: string;
  type: "REVIEW";
  activityType: "REVIEW_CREATED";
  createdAt: string;

  user: FeedUser;
  game: FeedGame;

  review: {
    id: string;
    body: string;
    isSpoiler: boolean;
    likes: number;
  };
};

type RatingActivity = {
  id: string;
  type: "RATING";

  activityType:
    | "RATING_CREATED"
    | "RATING_UPDATED";

  createdAt: string;

  user: FeedUser;
  game: FeedGame;

  rating: {
    score: number;
  };
};

type LibraryActivity = {
  id: string;
  type: "LIBRARY";

  activityType:
    | "LIBRARY_ADDED"
    | "LIBRARY_STATUS_CHANGED";

  createdAt: string;

  user: FeedUser;
  game: FeedGame;

  library: {
    status:
      | "WANT_TO_PLAY"
      | "PLAYING"
      | "COMPLETED"
      | "DROPPED"
      | "PAUSED"
      | "IN_LIBRARY";
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

type RecommendationActivity = {
  id: string;
  type: "RECOMMENDATION";

  activityType:
    "RECOMMENDATION_CREATED";

  createdAt: string;

  user: FeedUser;
  game: FeedGame;

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

type FeedActivity =
  | ReviewActivity
  | LibraryActivity
  | RatingActivity
  | RecommendationActivity;

type FeedResponse = {
  items: FeedActivity[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

type FeedFilter =
  | "ALL"
  | "LIBRARY"
  | "REVIEW"
  | "RATING"
  | "RECOMMENDATION";

const statusLabels: Record<
  LibraryActivity["library"]["status"],
  string
> = {
  WANT_TO_PLAY:
    "quer jogar",

  PLAYING:
    "está jogando",

  COMPLETED:
    "concluiu",

  DROPPED:
    "abandonou",

  PAUSED:
    "pausou",

  IN_LIBRARY:
    "adicionou à biblioteca",
};

const recommendationAspectLabels: Record<
  RecommendationAspectType,
  string
> = {
  STORY:
    "História",

  GAMEPLAY:
    "Gameplay",

  MECHANICS:
    "Mecânicas",

  ATMOSPHERE:
    "Atmosfera / Feeling",

  EXPLORATION:
    "Exploração",

  PROGRESSION:
    "Progressão",

  DIFFICULTY:
    "Dificuldade",

  MULTIPLAYER:
    "Multiplayer",

  ART_STYLE:
    "Visual / Arte",

  SOUNDTRACK:
    "Trilha sonora",
};

function formatDate(
  date: string,
) {
  return new Date(
    date,
  ).toLocaleString(
    "pt-BR",
    {
      dateStyle:
        "short",

      timeStyle:
        "short",
    },
  );
}

function getLibraryActivityText(
  activityType:
    LibraryActivity["activityType"],

  status:
    LibraryActivity["library"]["status"],
) {
  if (
    activityType ===
    "LIBRARY_ADDED"
  ) {
    return "adicionou à biblioteca";
  }

  return (
    statusLabels[
      status
    ] ??
    "atualizou a biblioteca"
  );
}

export default function FeedPage() {
  const router =
    useRouter();

  const {
    token,
    user,
    loading:
      authLoading,
  } = useAuth();

  const [
    activities,
    setActivities,
  ] = useState<
    FeedActivity[]
  >([]);

  const [
    filter,
    setFilter,
  ] =
    useState<FeedFilter>(
      "ALL",
    );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    hasMore,
    setHasMore,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const filteredActivities =
    filter === "ALL"
      ? activities
      : activities.filter(
          (
            activity,
          ) =>
            activity.type ===
            filter,
        );

  useEffect(() => {
    if (
      authLoading
    ) {
      return;
    }

    if (
      !token ||
      !user
    ) {
      router.replace(
        "/login",
      );

      return;
    }

    async function loadFeed() {
      try {
        setLoading(
          true,
        );

        const data =
          await apiJson<
            FeedResponse
          >(
            "/users/feed?page=1&limit=10",
            {
              token,
            },
          );

        setActivities(
          data.items,
        );

        setPage(1);

        setHasMore(
          data.pagination
            .hasMore,
        );

        setError("");
      } catch (
        error
      ) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Não foi possível carregar o feed.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    }

    loadFeed();
  }, [
    authLoading,
    token,
    user,
    router,
  ]);

  async function handleLoadMore() {
    if (
      !token ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }

    const nextPage =
      page + 1;

    setLoadingMore(
      true,
    );

    setError("");

    try {
      const data =
        await apiJson<
          FeedResponse
        >(
          `/users/feed?page=${nextPage}&limit=10`,
          {
            token,
          },
        );

      setActivities(
        (
          current,
        ) => [
          ...current,
          ...data.items,
        ],
      );

      setPage(
        nextPage,
      );

      setHasMore(
        data.pagination
          .hasMore,
      );
    } catch (
      error
    ) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Não foi possível carregar mais atividades.",
      );
    } finally {
      setLoadingMore(
        false,
      );
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main>
        <Header />

        <section className="feed-page">
          <p>
            Carregando
            feed...
          </p>
        </section>
      </main>
    );
  }

  if (
    !token ||
    !user
  ) {
    return null;
  }

  return (
    <main>
      <Header />

      <section className="feed-page">
        <div className="feed-header">
          <div>
            <span className="feed-eyebrow">
              Comunidade
            </span>

            <h1>
              Seu feed
            </h1>

            <p>
              Veja o que as
              pessoas que você
              segue estão
              jogando e
              comentando.
            </p>
          </div>
        </div>

        <div className="feed-filters">
          <button
            type="button"
            className={
              filter ===
              "ALL"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "ALL",
              )
            }
          >
            Todos
          </button>

          <button
            type="button"
            className={
              filter ===
              "LIBRARY"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "LIBRARY",
              )
            }
          >
            Biblioteca
          </button>

          <button
            type="button"
            className={
              filter ===
              "REVIEW"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "REVIEW",
              )
            }
          >
            Reviews
          </button>

          <button
            type="button"
            className={
              filter ===
              "RECOMMENDATION"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "RECOMMENDATION",
              )
            }
          >
            Recomendações
          </button>

          <button
            type="button"
            className={
              filter ===
              "RATING"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "RATING",
              )
            }
          >
            Avaliações
          </button>
        </div>

        {error && (
          <div className="empty-state">
            {error}
          </div>
        )}

        {!error &&
        filteredActivities.length ===
          0 ? (
          <div className="empty-state">
            {filter ===
            "ALL" ? (
              <>
                <p>
                  Seu feed
                  ainda está
                  vazio.
                </p>

                <a href="/community">
                  Encontrar
                  pessoas para
                  seguir
                </a>
              </>
            ) : (
              <p>
                Nenhuma
                atividade
                encontrada
                neste filtro.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="feed-list">
              {filteredActivities.map(
                (
                  activity,
                ) => (
                  <article
                    key={
                      activity.id
                    }
                    className="feed-card"
                  >
                    <div className="feed-card-header">
                      <a
                        href={`/users/${activity.user.username}`}
                        className="feed-user"
                      >
                        {activity
                          .user
                          .avatarUrl ? (
                          <img
                            src={
                              activity
                                .user
                                .avatarUrl
                            }
                            alt={`Avatar de ${activity.user.username}`}
                          />
                        ) : (
                          <div className="feed-user-placeholder">
                            {(activity
                              .user
                              .displayName ||
                              activity
                                .user
                                .username)
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong>
                            {activity
                              .user
                              .displayName ||
                              activity
                                .user
                                .username}
                          </strong>

                          <span>
                            @
                            {
                              activity
                                .user
                                .username
                            }
                          </span>
                        </div>
                      </a>

                      <time>
                        {formatDate(
                          activity.createdAt,
                        )}
                      </time>
                    </div>

                    <div className="feed-type-badge">
                      {activity.type ===
                      "REVIEW"
                        ? "Review"
                        : activity.type ===
                            "RATING"
                          ? "Avaliação"
                          : activity.type ===
                              "RECOMMENDATION"
                            ? "Recomendação"
                            : "Biblioteca"}
                    </div>

                    <div className="feed-content">
                      {activity.type !== "RECOMMENDATION" &&
                        activity.game.coverUrl && (
                        <a
                          href={`/games/${activity.game.slug}`}
                          className="feed-game-cover"
                        >
                          <img
                            src={activity.game.coverUrl}
                            alt={`Capa de ${activity.game.title}`}
                          />
                        </a>
                      )}

                      <div className="feed-content-main">

                        {activity.type ===
                        "REVIEW" ? (
                          <>
                            <p className="feed-action-text">
                              <strong>
                                {activity
                                  .user
                                  .displayName ||
                                  activity
                                    .user
                                    .username}
                              </strong>{" "}
                              publicou
                              uma review
                              de{" "}
                              <a
                                href={`/games/${activity.game.slug}`}
                              >
                                {
                                  activity
                                    .game
                                    .title
                                }
                              </a>
                            </p>

                            {activity
                              .review
                              .isSpoiler ? (
                              <details className="feed-review">
                                <summary>
                                  Review
                                  contém
                                  spoiler
                                </summary>

                                <p>
                                  {
                                    activity
                                      .review
                                      .body
                                  }
                                </p>
                              </details>
                            ) : (
                              <p className="feed-review-text">
                                {
                                  activity
                                    .review
                                    .body
                                }
                              </p>
                            )}

                            <span className="feed-meta">
                              {
                                activity
                                  .review
                                  .likes
                              }{" "}
                              {activity
                                .review
                                .likes ===
                              1
                                ? "curtida"
                                : "curtidas"}
                            </span>
                          </>
                        ) : activity.type ===
                          "RATING" ? (
                          <>
                            <p className="feed-action-text">
                              <strong>
                                {activity
                                  .user
                                  .displayName ||
                                  activity
                                    .user
                                    .username}
                              </strong>{" "}
                              {activity.activityType ===
                              "RATING_CREATED"
                                ? "avaliou"
                                : "atualizou a avaliação de"}{" "}
                              <a
                                href={`/games/${activity.game.slug}`}
                              >
                                {
                                  activity
                                    .game
                                    .title
                                }
                              </a>{" "}
                              com nota{" "}
                              <strong>
                                {
                                  activity
                                    .rating
                                    .score
                                }
                                /10
                              </strong>
                            </p>

                            <div className="feed-rating-score">
                              {
                                activity
                                  .rating
                                  .score
                              }

                              <span>
                                /10
                              </span>
                            </div>
                          </>
                        ) : activity.type ===
                          "RECOMMENDATION" ? (
                          <>
                            <div className="feed-recommendation-card">
                              <div className="feed-recommendation-cover">
                                {activity.recommendation
                                  .recommendedGame
                                  .coverUrl ? (
                                  <a
                                    href={`/games/${activity.recommendation.recommendedGame.slug}`}
                                  >
                                    <img
                                      src={
                                        activity.recommendation
                                          .recommendedGame
                                          .coverUrl
                                      }
                                      alt={`Capa de ${activity.recommendation.recommendedGame.title}`}
                                    />
                                  </a>
                                ) : (
                                  <div className="feed-game-cover-placeholder">
                                    Sem capa
                                  </div>
                                )}
                              </div>

                              <div className="feed-recommendation-content">
                                <span className="feed-label">
                                  Recomendado
                                </span>

                                <a
                                  href={`/games/${activity.recommendation.recommendedGame.slug}`}
                                  className="feed-game-title"
                                >
                                  {
                                    activity.recommendation
                                      .recommendedGame
                                      .title
                                  }
                                </a>

                                <div className="feed-recommendation-aspects">
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

                                <p className="feed-action-text">
                                  <strong>
                                    {activity.user.displayName ||
                                      activity.user.username}
                                  </strong>{" "}
                                  recomendou{" "}
                                  <a
                                    href={`/games/${activity.recommendation.recommendedGame.slug}`}
                                  >
                                    {
                                      activity.recommendation
                                        .recommendedGame
                                        .title
                                    }
                                  </a>{" "}
                                  para quem gostou de{" "}
                                  <a
                                    href={`/games/${activity.game.slug}`}
                                  >
                                    {activity.game.title}
                                  </a>
                                </p>

                                <p className="feed-review-text">
                                  {
                                    activity.recommendation
                                      .body
                                  }
                                </p>

                                <span className="feed-meta">
                                  {
                                    activity.recommendation
                                      .supportCount
                                  }{" "}
                                  {activity.recommendation
                                    .supportCount === 1
                                    ? "pessoa também recomenda"
                                    : "pessoas também recomendam"}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : activity.type ===
                          "LIBRARY" ? (
                          <p className="feed-action-text">
                            <strong>
                              {activity
                                .user
                                .displayName ||
                                activity
                                  .user
                                  .username}
                            </strong>{" "}
                            {getLibraryActivityText(
                              activity.activityType,
                              activity
                                .library
                                .status,
                            )}{" "}
                            <a
                              href={`/games/${activity.game.slug}`}
                            >
                              {
                                activity
                                  .game
                                  .title
                              }
                            </a>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            {hasMore && (
              <div className="feed-load-more">
                <button
                  type="button"
                  onClick={
                    handleLoadMore
                  }
                  disabled={
                    loadingMore
                  }
                >
                  {loadingMore
                    ? "Carregando..."
                    : "Carregar mais"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}