"use client";

import {
  useEffect,
  useState,
} from "react";

import { apiJson } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type GameStatus =
  | "WANT_TO_PLAY"
  | "PLAYING"
  | "COMPLETED"
  | "DROPPED"
  | "PAUSED"
  | "IN_LIBRARY";

type LibraryEntry = {
  id: string;
  gameId: string;
  status: GameStatus;
};

type LibraryButtonProps = {
  gameId: string;
};

const statusLabels: Record<
  GameStatus,
  string
> = {
  WANT_TO_PLAY: "Quero jogar",
  PLAYING: "Jogando",
  COMPLETED: "Concluído",
  DROPPED: "Abandonado",
  PAUSED: "Pausado",
  IN_LIBRARY: "Na biblioteca",
};

export default function LibraryButton({
  gameId,
}: LibraryButtonProps) {
  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [entry, setEntry] =
    useState<LibraryEntry | null>(null);

  const [selectedStatus, setSelectedStatus] =
    useState<GameStatus>("WANT_TO_PLAY");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      setLoading(false);
      return;
    }

    async function checkLibrary() {
      try {
        const data =
          await apiJson<LibraryEntry | null>(
            `/library/games/${gameId}`,
            {
              token,
            },
          );

        setEntry(data);

        if (data) {
          setSelectedStatus(
            data.status,
          );
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível verificar sua biblioteca.",
        );
      } finally {
        setLoading(false);
      }
    }

    checkLibrary();
  }, [
    authLoading,
    user,
    token,
    gameId,
  ]);

  async function handleAdd() {
    if (!token) {
      setMessage(
        "Faça login para adicionar este jogo à biblioteca.",
      );

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data =
        await apiJson<LibraryEntry>(
          `/library/games/${gameId}`,
          {
            method: "POST",
            token,

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status:
                selectedStatus,
            }),
          },
        );

      setEntry(data);

      setMessage(
        "Jogo adicionado à biblioteca.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o jogo.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    status: GameStatus,
  ) {
    if (!token || !entry) {
      return;
    }

    setSelectedStatus(status);
    setSaving(true);
    setMessage("");

    try {
      const data =
        await apiJson<LibraryEntry>(
          `/library/games/${gameId}/status`,
          {
            method: "PATCH",
            token,

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status,
            }),
          },
        );

      setEntry(data);

      setMessage(
        "Status atualizado.",
      );
    } catch (error) {
      setSelectedStatus(
        entry.status,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!token) {
      return;
    }

    const confirmed =
      window.confirm(
        "Deseja remover este jogo da sua biblioteca?",
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await apiJson(
        `/library/games/${gameId}`,
        {
          method: "DELETE",
          token,
        },
      );

      setEntry(null);

      setSelectedStatus(
        "WANT_TO_PLAY",
      );

      setMessage(
        "Jogo removido da biblioteca.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o jogo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="library-button-container">
        <button
          type="button"
          disabled
        >
          Carregando...
        </button>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="library-button-container">
        <p>
          Faça login para adicionar este
          jogo à sua biblioteca.
        </p>
      </div>
    );
  }

  return (
    <div className="library-button-container">
      <div className="library-status-field">
        <label
          htmlFor={`library-status-${gameId}`}
        >
          {entry
            ? "Status na biblioteca"
            : "Adicionar como"}
        </label>

        <select
          id={`library-status-${gameId}`}
          value={selectedStatus}
          disabled={saving}
          onChange={(event) => {
            const status =
              event.target
                .value as GameStatus;

            if (entry) {
              handleStatusChange(
                status,
              );
            } else {
              setSelectedStatus(
                status,
              );
            }
          }}
        >
          <option value="WANT_TO_PLAY">
            Quero jogar
          </option>

          <option value="PLAYING">
            Jogando
          </option>

          <option value="COMPLETED">
            Concluído
          </option>

          <option value="PAUSED">
            Pausado
          </option>

          <option value="DROPPED">
            Abandonado
          </option>

          <option value="IN_LIBRARY">
            Na biblioteca
          </option>
        </select>
      </div>

      {entry ? (
        <>
          <p className="library-button-status">
            Na sua biblioteca como{" "}
            <strong>
              {
                statusLabels[
                  entry.status
                ]
              }
            </strong>
          </p>

          <button
            type="button"
            className="library-remove-button"
            onClick={handleRemove}
            disabled={saving}
          >
            {saving
              ? "Processando..."
              : "Remover da biblioteca"}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="library-add-button"
          onClick={handleAdd}
          disabled={saving}
        >
          {saving
            ? "Adicionando..."
            : `Adicionar como ${statusLabels[selectedStatus]}`}
        </button>
      )}

      {message && (
        <p className="library-button-message">
          {message}
        </p>
      )}
    </div>
  );
}