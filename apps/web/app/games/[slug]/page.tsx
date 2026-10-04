import LibraryButton from "../../../components/LibraryButton";
import Header from "../../../components/Header";
import GameRating from "../../../components/GameRating";
import GameReviews from "../../../components/GameReviews";

type Game = {
  id: string;
  igdbId: number | null;
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

  developers: {
    id: number;
    name: string;
  }[];

  publishers: {
    id: number;
    name: string;
  }[];
};

type GamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getGame(
  slug: string,
): Promise<Game> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/games/slug/${slug}`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Jogo não encontrado.",
    );
  }

  return response.json();
}

export default async function GamePage({
  params,
}: GamePageProps) {
  const { slug } = await params;

  const game =
    await getGame(slug);

  return (
    <main>
      <Header />

      <section className="game-page">

          <nav
            className="game-breadcrumb"
            aria-label="Breadcrumb"
          >
            <a href="/">
              Início
            </a>

            <span>/</span>

            <a href="/games">
              Jogos
            </a>

            <span>/</span>

            <span>
              {game.title}
            </span>
          </nav>

        <div className="game-details">
          <div className="game-details-cover">
            {game.coverUrl ? (
              <img
                src={game.coverUrl}
                alt={`Capa de ${game.title}`}
              />
            ) : (
              <div className="game-details-no-cover">
                Sem capa
              </div>
            )}
          </div>

          <div className="game-details-content">
            <div className="game-details-heading">
              <h1>
                {game.title}
              </h1>

              {game.releaseDate && (
                <span className="game-release-date">
                  {new Date(
                    game.releaseDate,
                  ).toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              )}
            </div>

            {game.genres.length >
              0 && (
              <div className="game-details-meta">
                {game.genres.map(
                  (genre) => (
                    <span
                      key={
                        genre.id
                      }
                    >
                      {genre.name}
                    </span>
                  ),
                )}
              </div>
            )}

            {game.platforms.length >
              0 && (
              <div className="game-info-row">
                <strong>
                  Plataformas
                </strong>

                <span>
                  {game.platforms
                    .map(
                      (platform) =>
                        platform.name,
                    )
                    .join(", ")}
                </span>
              </div>
            )}

            {game.developers.length >
              0 && (
              <div className="game-info-row">
                <strong>
                  Desenvolvedor
                </strong>

                <span>
                  {game.developers
                    .map(
                      (developer) =>
                        developer.name,
                    )
                    .join(", ")}
                </span>
              </div>
            )}

            {game.publishers.length >
              0 && (
              <div className="game-info-row">
                <strong>
                  Publicadora
                </strong>

                <span>
                  {game.publishers
                    .map(
                      (publisher) =>
                        publisher.name,
                    )
                    .join(", ")}
                </span>
              </div>
            )}

            {game.description && (
              <div className="game-description-block">
                <h2>
                  Sobre o jogo
                </h2>

                <p className="game-details-description">
                  {game.description}
                </p>
              </div>
            )}

            <div className="game-details-actions">
              <LibraryButton
                gameId={
                  game.id
                }
              />
            </div>
          </div>
        </div>

        <GameRating
          gameId={game.id}
        />

        <GameReviews
          gameId={game.id}
        />
      </section>
    </main>
  );
}