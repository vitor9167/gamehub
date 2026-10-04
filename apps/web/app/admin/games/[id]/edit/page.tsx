"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Header from "../../../../../components/Header";

import { useAuth } from "../../../../../contexts/AuthContext";
import { apiJson } from "../../../../../lib/api";

type AdminGame = {
  id: string;
  title: string;
  slug: string;

  description: string | null;
  coverUrl: string | null;
  releaseDate: string | null;

  igdbId?: number | null;
  externalSource?: string | null;
};

export default function EditGamePage() {
  const router = useRouter();
  const params = useParams();

  const gameId = params.id as string;

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [coverUrl, setCoverUrl] =
    useState("");

  const [releaseDate, setReleaseDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

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

    async function loadGame() {
      try {
        const game =
          await apiJson<AdminGame>(
            `/admin/games/${gameId}`,
            {
              token,
            },
          );

        setTitle(
          game.title,
        );

        setSlug(
          game.slug,
        );

        setDescription(
          game.description ?? "",
        );

        setCoverUrl(
          game.coverUrl ?? "",
        );

        setReleaseDate(
          game.releaseDate
            ? game.releaseDate.slice(
                0,
                10,
              )
            : "",
        );

        setError("");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o jogo.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [
    authLoading,
    user,
    token,
    router,
    gameId,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const game =
        await apiJson<AdminGame>(
          `/admin/games/${gameId}`,
          {
            method: "PATCH",
            token,

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title:
                title.trim(),

              slug:
                slug.trim(),

              description:
                description.trim() ||
                undefined,

              coverUrl:
                coverUrl.trim() ||
                undefined,

              releaseDate:
                releaseDate ||
                undefined,
            }),
          },
        );

      setTitle(
        game.title,
      );

      setSlug(
        game.slug,
      );

      setDescription(
        game.description ?? "",
      );

      setCoverUrl(
        game.coverUrl ?? "",
      );

      setReleaseDate(
        game.releaseDate
          ? game.releaseDate.slice(
              0,
              10,
            )
          : "",
      );

      setMessage(
        "Jogo atualizado com sucesso.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o jogo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main>
        <Header />

        <section>
          <p>
            Carregando jogo...
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

  if (error && !title) {
    return (
      <main>
        <Header />

        <section>
          <p className="error-message">
            {error}
          </p>

          <a href="/admin/games">
            ← Voltar para jogos
          </a>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Header />

      <section className="admin-edit-page">
        <a href="/admin/games">
          ← Voltar para jogos
        </a>

        <h2>
          Editar jogo
        </h2>

        <form
          className="admin-edit-form"
          onSubmit={handleSubmit}
        >
          <label>
            Título

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              maxLength={255}
              required
            />
          </label>

          <label>
            Slug

            <input
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value,
                )
              }
              maxLength={300}
              required
            />
          </label>

          <label>
            Descrição

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={8}
            />
          </label>

          <label>
            URL da capa

            <input
              type="url"
              value={coverUrl}
              onChange={(event) =>
                setCoverUrl(
                  event.target.value,
                )
              }
              placeholder="https://..."
            />
          </label>

          <label>
            Data de lançamento

            <input
              type="date"
              value={releaseDate}
              onChange={(event) =>
                setReleaseDate(
                  event.target.value,
                )
              }
            />
          </label>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Salvando..."
              : "Salvar alterações"}
          </button>

          {message && (
            <p className="profile-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}