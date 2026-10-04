"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import AdminDeleteGameButton from "../../../components/AdminDeleteGameButton";

import { useAuth } from "../../../contexts/AuthContext";
import { apiJson } from "../../../lib/api";

type AdminGame = {
  id: string;
  igdbId: number | null;

  title: string;
  slug: string;

  description: string | null;
  coverUrl: string | null;

  releaseDate: string | null;
  externalSource: string | null;

  createdAt?: string;
  updatedAt?: string;
};

export default function AdminGamesPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [games, setGames] =
    useState<AdminGame[]>([]);

  const [gamesLoading, setGamesLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
      return;
    }

    async function loadGames() {
      try {
        const data =
          await apiJson<AdminGame[]>(
            "/admin/games",
            {
              token,
            },
          );

        setGames(data);
        setError("");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os jogos.",
        );
      } finally {
        setGamesLoading(false);
      }
    }

    loadGames();
  }, [
    authLoading,
    user,
    token,
    router,
  ]);

  function handleDeleted(
    gameId: string,
  ) {
    setGames((current) =>
      current.filter(
        (game) =>
          game.id !== gameId,
      ),
    );
  }

  if (
    authLoading ||
    gamesLoading
  ) {
    return (
      <main>
        <Header />

        <section>
          <p>
            Carregando jogos...
          </p>
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
        <div className="admin-page-header">
          <div>
            <h2>
              Gerenciar catálogo
            </h2>

            <p>
              Visualize, edite e remova
              os jogos cadastrados.
            </p>
          </div>

          <span>
            {games.length}{" "}
            {games.length === 1
              ? "jogo"
              : "jogos"}
          </span>
        </div>

        {error ? (
          <p className="error-message">
            {error}
          </p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    Jogo
                  </th>

                  <th>
                    Origem
                  </th>

                  <th>
                    IGDB ID
                  </th>

                  <th>
                    Lançamento
                  </th>

                  <th>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {games.map(
                  (game) => (
                    <tr key={game.id}>
                      <td>
                        {game.title}
                      </td>

                      <td>
                        {game.externalSource ||
                          "-"}
                      </td>

                      <td>
                        {game.igdbId ??
                          "-"}
                      </td>

                      <td>
                        {game.releaseDate
                          ? new Date(
                              game.releaseDate,
                            ).toLocaleDateString(
                              "pt-BR",
                            )
                          : "-"}
                      </td>

                      <td>
                        <div className="admin-actions">
                          <a
                            href={`/games/${game.slug}`}
                          >
                            Ver
                          </a>

                          <a
                            href={`/admin/games/${game.id}/edit`}
                          >
                            Editar
                          </a>

                          <AdminDeleteGameButton
                            gameId={
                              game.id
                            }
                            gameTitle={
                              game.title
                            }
                            onDeleted={
                              handleDeleted
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        {!error &&
          games.length === 0 && (
            <p>
              Nenhum jogo encontrado.
            </p>
          )}
      </section>
    </main>
  );
}