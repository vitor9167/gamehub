import GameCard from "../../components/GameCard";
import SearchBar from "../../components/SearchBar";
import GameFilters from "../../components/GameFilters";
import Header from "../../components/Header";

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

type GamesPageProps = {
  searchParams: Promise<{
    search?: string;
    genre?: string;
    platform?: string;
    page?: string;
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

type PaginationItem =
  | number
  | "ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  const items: PaginationItem[] =
    [];

  if (totalPages <= 7) {
    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      items.push(page);
    }

    return items;
  }

  items.push(1);

  if (currentPage > 4) {
    items.push("ellipsis");
  }

  const start = Math.max(
    2,
    currentPage - 2,
  );

  const end = Math.min(
    totalPages - 1,
    currentPage + 2,
  );

  for (
    let page = start;
    page <= end;
    page++
  ) {
    items.push(page);
  }

  if (
    currentPage <
    totalPages - 3
  ) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

async function getGames(
  search?: string,
  genre?: string,
  platform?: string,
  page = 1,
  limit = 10,
): Promise<GamesResponse> {
  const params =
    new URLSearchParams();

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
    "page",
    String(page),
  );

  params.set(
    "limit",
    String(limit),
  );

  const queryString =
    params.toString();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response =
    await fetch(
      `${API_URL}/games?${queryString}`,
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

export default async function GamesPage({
  searchParams,
}: GamesPageProps) {
  const params =
    await searchParams;

  const search =
    params.search ?? "";

  const genre =
    params.genre ?? "";

  const platform =
    params.platform ?? "";

  const rawPage =
    Number(
      params.page ?? "1",
    );

  const page =
    Number.isFinite(rawPage) &&
    rawPage > 0
      ? rawPage
      : 1;

  const result =
    await getGames(
      search,
      genre,
      platform,
      page,
    );

  const games =
    result.items;

  const pagination =
    result.pagination;

  const paginationItems =
    getPaginationItems(
      pagination.page,
      pagination.totalPages,
    );

  function buildPageUrl(
    pageNumber: number,
  ) {
    const query =
      new URLSearchParams();

    if (search) {
      query.set(
        "search",
        search,
      );
    }

    if (genre) {
      query.set(
        "genre",
        genre,
      );
    }

    if (platform) {
      query.set(
        "platform",
        platform,
      );
    }

    query.set(
      "page",
      String(pageNumber),
    );

    return `/games?${query.toString()}`;
  }

  return (
    <main>
      <Header />

      <section>
        <div className="page-header">
          <div className="page-header-text">
            <h1>
              Jogos
            </h1>

            <p>
              Explore o catálogo
              do GameHub.
            </p>
          </div>

          <span className="page-header-meta">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "jogo encontrado"
              : "jogos encontrados"}
          </span>
        </div>

        <SearchBar
          initialSearch={search}
        />

        <GameFilters
          genre={genre}
          platform={platform}
        />

        {search && (
          <p className="games-search-result">
            Resultados para:{" "}
            <strong>
              {search}
            </strong>
          </p>
        )}

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
            Nenhum jogo encontrado.
          </div>
        )}

        {pagination.totalPages >
          1 && (
          <div className="pagination">
            {pagination.page >
              1 && (
              <a
                href={buildPageUrl(
                  pagination.page -
                    1,
                )}
                className="pagination-nav"
              >
                ← Anterior
              </a>
            )}

            <div className="pagination-pages">
              {paginationItems.map(
                (
                  item,
                  index,
                ) => {
                  if (
                    item ===
                    "ellipsis"
                  ) {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="pagination-ellipsis"
                      >
                        …
                      </span>
                    );
                  }

                  return (
                    <a
                      key={item}
                      href={buildPageUrl(
                        item,
                      )}
                      className={
                        item ===
                        pagination.page
                          ? "pagination-page active"
                          : "pagination-page"
                      }
                    >
                      {item}
                    </a>
                  );
                },
              )}
            </div>

            {pagination.page <
              pagination.totalPages && (
              <a
                href={buildPageUrl(
                  pagination.page +
                    1,
                )}
                className="pagination-nav"
              >
                Próxima →
              </a>
            )}
          </div>
        )}
      </section>
    </main>
  );
}