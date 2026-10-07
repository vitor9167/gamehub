import Header from "../../components/Header";

type PublicUser = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;

  stats: {
    games: number;
    reviews: number;
    ratings: number;
  };
};

type UsersResponse = {
  items: PublicUser[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type CommunityPageProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

async function getUsers(
  search?: string,
  page = 1,
): Promise<UsersResponse> {
  const params =
    new URLSearchParams();

  if (search) {
    params.set(
      "search",
      search,
    );
  }

  params.set(
    "page",
    String(page),
  );

  params.set(
    "limit",
    "12",
  );

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response =
    await fetch(
      `${API_URL}/users?${params.toString()}`,
      {
        cache: "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      "Não foi possível carregar os usuários.",
    );
  }

  return response.json();
}

export default async function CommunityPage({
  searchParams,
}: CommunityPageProps) {
  const params =
    await searchParams;

  const search =
    params.search ?? "";

  const page =
    Number(
      params.page ?? "1",
    );

  const result =
    await getUsers(
      search,
      page,
    );

  const users =
    result.items;

  const pagination =
    result.pagination;

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

    query.set(
      "page",
      String(pageNumber),
    );

    return `/community?${query.toString()}`;
  }

  return (
    <main>
      <Header />

      <section className="community-page">
        <div className="page-header">
          <div className="page-header-text">
            <h1>
              Comunidade
            </h1>

            <p>
              Encontre outros jogadores
              e conheça suas bibliotecas.
            </p>
          </div>

          <span className="page-header-meta">
            {pagination.total}{" "}
            {pagination.total === 1
              ? "usuário"
              : "usuários"}
          </span>
        </div>

        <form
          className="community-search"
          action="/community"
          method="GET"
        >
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Pesquisar por nome ou @username..."
          />

          <button type="submit">
            Buscar
          </button>
        </form>

        {search && (
          <div className="community-search-info">
            <span>
              Resultados para{" "}
              <strong>
                {search}
              </strong>
            </span>

            <a href="/community">
              Limpar busca
            </a>
          </div>
        )}

        {users.length > 0 ? (
          <div className="community-grid">
            {users.map(
              (profile) => (
                <article
                  key={profile.id}
                  className="user-card"
                >
                  <a
                    href={`/users/${profile.username}`}
                    className="user-card-link"
                  >
                    <div className="user-card-header">
                      {profile.avatarUrl ? (
                        <img
                          src={
                            profile.avatarUrl
                          }
                          alt={`Avatar de ${profile.username}`}
                          className="user-card-avatar"
                        />
                      ) : (
                        <div className="user-card-avatar-placeholder">
                          {(
                            profile.displayName ||
                            profile.username
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="user-card-identity">
                        <h2>
                          {profile.displayName ||
                            profile.username}
                        </h2>

                        <span>
                          @{profile.username}
                        </span>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="user-card-bio">
                        {profile.bio}
                      </p>
                    )}

                    <div className="user-card-stats">
                      <div>
                        <strong>
                          {profile.stats.games}
                        </strong>

                        <span>
                          Jogos
                        </span>
                      </div>

                      <div>
                        <strong>
                          {profile.stats.reviews}
                        </strong>

                        <span>
                          Reviews
                        </span>
                      </div>

                      <div>
                        <strong>
                          {profile.stats.ratings}
                        </strong>

                        <span>
                          Avaliações
                        </span>
                      </div>
                    </div>

                    <span className="user-card-action">
                      Ver perfil →
                    </span>
                  </a>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="empty-state">
            Nenhum usuário encontrado.
          </div>
        )}

        {pagination.totalPages >
          1 && (
          <div className="pagination">
            {page > 1 && (
              <a
                href={buildPageUrl(
                  page - 1,
                )}
              >
                ← Anterior
              </a>
            )}

            <div className="pagination-pages">
              {Array.from(
                {
                  length:
                    pagination.totalPages,
                },
                (_, index) =>
                  index + 1,
              ).map(
                (pageNumber) => (
                  <a
                    key={
                      pageNumber
                    }
                    href={buildPageUrl(
                      pageNumber,
                    )}
                    className={
                      pageNumber ===
                      page
                        ? "pagination-active"
                        : ""
                    }
                  >
                    {pageNumber}
                  </a>
                ),
              )}
            </div>

            {page <
              pagination.totalPages && (
              <a
                href={buildPageUrl(
                  page + 1,
                )}
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