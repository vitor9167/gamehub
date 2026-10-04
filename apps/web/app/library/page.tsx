"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import GameCard from "../../components/GameCard";
import LibraryStatusSelect from "../../components/LibraryStatusSelect";
import RemoveFromLibraryButton from "../../components/RemoveFromLibraryButton";

import { useAuth } from "../../contexts/AuthContext";
import { apiJson } from "../../lib/api";

type GameStatus =
  | "WANT_TO_PLAY"
  | "PLAYING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | "IN_LIBRARY";

type LibraryEntry = {
  id: string;
  status: GameStatus;

  playedMinutes: number;

  startedAt: string | null;
  completedAt: string | null;

  personalTags: string[];

  createdAt: string;
  updatedAt: string;

  game: {
    id: string;

    title: string;
    slug: string;

    description: string | null;
    coverUrl: string | null;
    releaseDate: string | null;

    genres: {
      genre: {
        id: number;
        name: string;
      };
    }[];

    platforms: {
      platform: {
        id: number;
        name: string;
      };
    }[];
  };
};

export default function LibraryPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [entries, setEntries] =
    useState<LibraryEntry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadLibrary() {
      setLoading(true);
      setError("");

      try {
        const data =
          await apiJson<LibraryEntry[]>(
            "/library",
            {
              token,
            },
          );

        if (!cancelled) {
          setEntries(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar sua biblioteca.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLibrary();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user?.id,
    token,
    router,
  ]);

  function handleRemove(
    gameId: string,
  ) {
    setEntries((current) =>
      current.filter(
        (entry) =>
          entry.game.id !== gameId,
      ),
    );
  }

  function handleStatusChange(
    gameId: string,
    newStatus: GameStatus,
  ) {
    setEntries((current) =>
      current.map((entry) => {
        if (
          entry.game.id !== gameId
        ) {
          return entry;
        }

        return {
          ...entry,
          status: newStatus,
        };
      }),
    );
  }

  if (authLoading || loading) {
    return (
      <main>
        <Header />

        <section>
          <div className="loading-state">
            <div className="loading-indicator">
              <span className="loading-spinner" />

              <span>
                Carregando biblioteca...
              </span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!user || !token) {
    return null;
  }

  return (
    <main>
      <Header />
      

      <section>
        <div className="library-header">
          <div>
            <h2>
              Minha biblioteca
            </h2>

            <p>
              Jogos adicionados à sua coleção.
            </p>
          </div>

          <span>
            {entries.length}{" "}
            {entries.length === 1
              ? "jogo"
              : "jogos"}
          </span>
        </div>

        {error && (
          <p className="feedback-message feedback-error">
            {error}
          </p>
        )}

        {!error &&
        entries.length === 0 ? (
          <div className="empty-state">
            <h3>
              Sua biblioteca está vazia
            </h3>

            <p>
              Explore o catálogo e adicione
              alguns jogos à sua coleção.
            </p>

            <a href="/games">
              Explorar jogos
            </a>
          </div>
        ) : (
          <div className="library-grid">
            {entries.map(
              (entry) => {
                const game =
                  entry.game;

                const genres =
                  game.genres.map(
                    (item) =>
                      item.genre,
                  );

                const platforms =
                  game.platforms.map(
                    (item) =>
                      item.platform,
                  );

                return (
                  <div
                    key={entry.id}
                    className="library-item"
                  >
                    <GameCard
                      game={{
                        id: game.id,
                        title:
                          game.title,
                        slug:
                          game.slug,
                        description:
                          game.description,
                        coverUrl:
                          game.coverUrl,
                        releaseDate:
                          game.releaseDate,
                        genres,
                        platforms,
                      }}
                    />

                    <div className="library-item-controls">
                      <LibraryStatusSelect
                        gameId={
                          game.id
                        }
                        currentStatus={
                          entry.status
                        }
                        onStatusChange={(
                          newStatus,
                        ) =>
                          handleStatusChange(
                            game.id,
                            newStatus,
                          )
                        }
                      />

                      <RemoveFromLibraryButton
                        gameId={
                          game.id
                        }
                        gameTitle={
                          game.title
                        }
                        onRemoved={() =>
                          handleRemove(
                            game.id,
                          )
                        }
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </section>
    </main>
  );
}