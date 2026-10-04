"use client";

import { FormEvent, useState,useEffect, } from "react";
import Header from "../../../components/Header";
import { apiJson } from "../../../lib/api";
import { useRouter } from "next/navigation";

import { useAuth } from "../../../contexts/AuthContext";

type IgdbGame = {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  first_release_date?: number;
  rating?: number;

  cover?: {
    url: string;
  };

  genres?: {
    name: string;
  }[];

  platforms?: {
    name: string;
  }[];
};

export default function ImportGamesPage() {
    const router = useRouter();

const { user, token, loading: authLoading,} = useAuth();


  const [search, setSearch] = useState("");
  const [games, setGames] = useState<IgdbGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
  if (authLoading) {
    return;
  }

  if (!user || !token) {
    router.replace("/login");
    return;
  }

  if (user.role !== "ADMIN") {
    router.replace("/");
  }
}, [authLoading, user, token, router]);

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await apiJson<IgdbGame[]>(
        `/igdb/search?q=${encodeURIComponent(query)}`,
      );

      setGames(data);
    } catch {
      setMessage(
        "Não foi possível pesquisar jogos.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleImport(gameId: number) {
  if (!token) {
    return;
  }

  setImportingId(gameId);
  setMessage("");

  try {
    const data = await apiJson<{
      game: {
        title: string;
      };
    }>(
      `/games/import/igdb/${gameId}`,
      {
        method: "POST",
        token,
      },
    );

    setMessage(
      `${data.game.title} importado com sucesso.`,
    );
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Não foi possível importar o jogo.",
    );
  } finally {
    setImportingId(null);
  }
}

  if (authLoading) {
  return (
    <main>
      <Header />

      <section>
        <p>Verificando permissões...</p>
      </section>
    </main>
  );
}

if (!user || !token) {
  return null;
}

if (user.role !== "ADMIN") {
  return null;
}

  return (
    <main>
      <Header />

      <section>
        <h2>Importar jogos</h2>

        <p>
          Pesquise jogos na IGDB e adicione-os ao catálogo do GameHub.
        </p>

        <form
          className="search-bar"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            placeholder="Ex.: Cyberpunk 2077"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Buscando..."
              : "Buscar"}
          </button>
        </form>

        {message && (
          <p>{message}</p>
        )}

        <div className="igdb-results">
          {games.map((game) => (
            <article
              key={game.id}
              className="igdb-result-card"
            >
              {game.cover?.url ? (
                <img
                  src={`https:${game.cover.url}`}
                  alt={`Capa de ${game.name}`}
                />
              ) : (
                <div className="igdb-no-cover">
                  Sem capa
                </div>
              )}

              <div className="igdb-result-content">
                <h3>{game.name}</h3>

                {game.first_release_date && (
                  <p>
                    {new Date(
                      game.first_release_date * 1000,
                    ).toLocaleDateString("pt-BR")}
                  </p>
                )}

                <p>
                  {game.genres
                    ?.map((genre) => genre.name)
                    .join(" • ") || "Sem gênero"}
                </p>

                <p>
                  {game.platforms
                    ?.slice(0, 5)
                    .map((platform) => platform.name)
                    .join(" • ") || "Sem plataforma"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handleImport(game.id)
                  }
                  disabled={
                    importingId === game.id
                  }
                >
                  {importingId === game.id
                    ? "Importando..."
                    : "Importar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}