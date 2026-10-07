import Header from "../../../components/Header";
import GameCard from "../../../components/GameCard";
import FollowButton from "../../../components/FollowButton";

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
    reviews: number;
    ratings: number;
    followers: number;
    following: number;
    };
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

type UserPageProps = {
  params: Promise<{
    username: string;
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
): Promise<PublicLibraryResponse> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/library`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return {
      isPrivate: false,
      items: [],
    };
  }

  return response.json();
}

async function getUserReviews(
  username: string,
): Promise<PublicReview[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/reviews`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function UserPage({
  params,
}: UserPageProps) {
  const { username } =
    await params;

  const [
    user,
    libraryResponse,
    reviews,
  ] = await Promise.all([
    getUser(username),
    getUserLibrary(username),
    getUserReviews(username),
  ]);

  const library =
    libraryResponse.items;

  return (
    <main>
      <Header />

      <section className="public-profile-page">
        <div className="public-profile-header">
          <div className="public-profile-main">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Avatar de ${user.username}`}
                className="public-profile-avatar"
              />
            ) : (
              <div className="public-profile-avatar-placeholder">
                {(
                  user.displayName ||
                  user.username
                )
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
                username={user.username}
                initialFollowers={
                  user.stats.followers
                }
              />
            </div>
          </div>

          <div className="public-profile-stats">
            <div>
                <strong>
                {user.stats.games}
                </strong>

                <span>
                Jogos
                </span>
            </div>

            <div>
                <strong>
                {user.stats.reviews}
                </strong>

                <span>
                Reviews
                </span>
            </div>

            <div>
                <strong>
                {user.stats.ratings}
                </strong>

                <span>
                Avaliações
                </span>
            </div>

            <a
            href={`/users/${user.username}/followers`}
            className="public-profile-stat-link"
          >
            <strong>
              {user.stats.followers}
            </strong>

            <span>
              Seguidores
            </span>
          </a>

          <a
            href={`/users/${user.username}/following`}
            className="public-profile-stat-link"
          >
            <strong>
              {user.stats.following}
            </strong>

            <span>
              Seguindo
            </span>
          </a>
        </div>
    </div>

        <div className="public-profile-section">
          <div className="public-profile-section-header">
            <div>
              <h2>
                Biblioteca
              </h2>

              <p>
                Jogos adicionados por{" "}
                {user.displayName ||
                  user.username}.
              </p>
            </div>
          </div>

          {libraryResponse.isPrivate ? (
            <div className="empty-state">
              A biblioteca deste usuário
              é privada.
            </div>
          ) : library.length > 0 ? (
            <div className="public-library-grid">
              {library.map(
                (entry) => (
                  <div
                    key={entry.id}
                    className="public-library-item"
                  >
                    <GameCard
                      game={entry.game}
                    />

                    <span className="public-library-status">
                      {
                        statusLabels[
                          entry.status
                        ]
                      }
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="empty-state">
              Este usuário ainda não
              adicionou jogos à
              biblioteca.
            </div>
          )}
        </div>

        <div className="public-profile-section">
          <div className="public-profile-section-header">
            <div>
              <h2>
                Reviews recentes
              </h2>

              <p>
                Opiniões publicadas por{" "}
                {user.displayName ||
                  user.username}.
              </p>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="public-reviews-list">
              {reviews.map(
                (review) => (
                  <article
                    key={review.id}
                    className="public-review-card"
                  >
                    <div className="public-review-game">
                      {review.game
                        .coverUrl && (
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
          ) : (
            <div className="empty-state">
              Este usuário ainda não
              publicou reviews.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}