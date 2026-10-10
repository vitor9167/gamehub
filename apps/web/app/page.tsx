import GameCard from "../components/GameCard";
import SearchBar from "../components/SearchBar";
import GameFilters from "../components/GameFilters";
import Header from "../components/Header";

type Game = {
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

type HomeProps = {
  searchParams: Promise<{
    search?: string;
    genre?: string;
    platform?: string;
  }>;
};

type GamesResponse = {
  items: Game[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function getGames(
  search?: string,
  genre?: string,
  platform?: string,
): Promise<GamesResponse> {
  const params = new URLSearchParams();

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  if (genre) {
    params.set(
      "genre",
      genre,
    );
  }

  if (platform) {
    params.set(
      "platform",
      platform,
    );
  }

  params.set(
    "limit",
    "8",
  );

  const queryString =
    params.toString();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

const response = await fetch(
  `${API_URL}/games?page=1&limit=6&sort=recent`,
  {
    cache: "no-store",
  },
);

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os jogos.",
    );
  }

  return response.json();
}

export default async function Home({
  searchParams,
}: HomeProps) {
  const params =
    await searchParams;

  const search =
    params.search ?? "";

  const genre =
    params.genre ?? "";

  const platform =
    params.platform ?? "";

  const result =
    await getGames(
      search,
      genre,
      platform,
    );

  const games =
    result.items;

  const totalGames =
    result.pagination.total;

  const featuredGames =
    games.slice(0, 4);

  const isFiltering =
    Boolean(
      search ||
      genre ||
      platform,
    );

  return (
    <main>
      <Header />

      <section className="home-page">
        <div className="home-hero">
          <div className="home-hero-content">
            <span className="home-eyebrow">
              GameHub
            </span>

            <h1>
              Descubra seu próximo jogo
            </h1>

            <p>
              Explore novos jogos,
              monte sua biblioteca pessoal
              e compartilhe suas avaliações
              com outros jogadores.
            </p>

            <div className="home-hero-actions">
              <a
                href="/games"
                className="home-primary-button"
              >
                Explorar jogos
              </a>

              <a
                href="/library"
                className="home-secondary-button"
              >
                Minha biblioteca
              </a>
            </div>
          </div>

          <div className="home-hero-stat">
            <strong>
              {totalGames}
            </strong>

            <span>
              {totalGames === 1
                ? "jogo no catálogo"
                : "jogos no catálogo"}
            </span>
          </div>
        </div>

        {!isFiltering && (
          <div className="home-section">
            <div className="home-section-header">
              <div>
                <h2>Adicionados recentemente</h2>

                <p>
                  Os jogos mais recentes adicionados ao GameHub.
                </p>
              </div>

              <a
                href="/games"
                className="home-section-link"
              >
                Ver catálogo →
              </a>
            </div>

            {featuredGames.length > 0 ? (
              <div className="games-grid">
                {featuredGames.map(
                  (game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="empty-state">
                Nenhum jogo disponível.
              </div>
            )}
          </div>
        )}

        <div className="home-section">
          <div className="home-section-header">
            <div>
              <h2>
                Encontre um jogo
              </h2>

              <p>
                Pesquise por nome, gênero
                ou plataforma.
              </p>
            </div>
          </div>

          <div className="home-search-section">
            <SearchBar
              initialSearch={search}
            />

            <GameFilters
              genre={genre}
              platform={platform}
            />
          </div>

          {isFiltering && (
            <>
              <div className="home-section-header">
                <div>
                  <h2>
                    Resultados
                  </h2>

                  <p>
                    {result.pagination.total}{" "}
                    {result.pagination.total === 1
                      ? "jogo encontrado"
                      : "jogos encontrados"}
                  </p>
                </div>

                <a
                  href="/"
                  className="home-section-link"
                >
                  Limpar filtros
                </a>
              </div>

              {games.length > 0 ? (
                <div className="games-grid">
                  {games.map(
                    (game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                      />
                    ),
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  Nenhum jogo encontrado
                  com esses filtros.
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}