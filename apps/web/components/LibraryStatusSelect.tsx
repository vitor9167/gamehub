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

type LibraryStatusSelectProps = {
  gameId: string;
  currentStatus: GameStatus;

  onStatusChange?: (
    newStatus: GameStatus,
  ) => void;
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

export default function LibraryStatusSelect({
  gameId,
  currentStatus,
  onStatusChange,
}: LibraryStatusSelectProps) {
  const { token } = useAuth();

  const [status, setStatus] =
    useState<GameStatus>(
      currentStatus,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  async function handleChange(
    newStatus: GameStatus,
  ) {
    if (!token) {
      return;
    }

    const previousStatus = status;

    setStatus(newStatus);
    setLoading(true);
    setError("");

    try {
      await apiJson(
        `/library/games/${gameId}/status`,
        {
          method: "PATCH",
          token,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      onStatusChange?.(
        newStatus,
      );
    } catch (error) {
      setStatus(
        previousStatus,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="library-status-control">
      <select
        value={status}
        disabled={loading}
        onChange={(event) =>
          handleChange(
            event.target
              .value as GameStatus,
          )
        }
      >
        {Object.entries(
          statusLabels,
        ).map(
          ([
            value,
            label,
          ]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ),
        )}
      </select>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}