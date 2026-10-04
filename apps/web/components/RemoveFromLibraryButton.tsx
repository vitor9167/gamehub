"use client";

import {
  useState,
} from "react";

import { apiJson } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type RemoveFromLibraryButtonProps = {
  gameId: string;
  gameTitle?: string;

  onRemoved?: () => void;
};

export default function RemoveFromLibraryButton({
  gameId,
  gameTitle,
  onRemoved,
}: RemoveFromLibraryButtonProps) {
  const { token } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleRemove() {
    if (!token) {
      return;
    }

    const confirmed =
      window.confirm(
        gameTitle
          ? `Deseja remover "${gameTitle}" da sua biblioteca?`
          : "Deseja remover este jogo da sua biblioteca?",
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiJson(
        `/library/games/${gameId}`,
        {
          method: "DELETE",
          token,
        },
      );

      onRemoved?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o jogo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="library-remove-control">
      <button
        type="button"
        onClick={
          handleRemove
        }
        disabled={
          loading
        }
      >
        {loading
          ? "Removendo..."
          : "Remover"}
      </button>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}