"use client";

import {
  useState,
} from "react";

import { apiJson } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type AdminDeleteGameButtonProps = {
  gameId: string;
  gameTitle: string;

  onDeleted?: (
    gameId: string,
  ) => void;
};

export default function AdminDeleteGameButton({
  gameId,
  gameTitle,
  onDeleted,
}: AdminDeleteGameButtonProps) {
  const { token } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleDelete() {
    if (!token) {
      return;
    }

    const confirmed =
      window.confirm(
        `Deseja realmente excluir "${gameTitle}" do catálogo?`,
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiJson(
        `/admin/games/${gameId}`,
        {
          method: "DELETE",
          token,
        },
      );

      onDeleted?.(
        gameId,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o jogo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-delete-control">
      <button
        type="button"
        className="admin-delete-button"
        onClick={
          handleDelete
        }
        disabled={
          loading
        }
      >
        {loading
          ? "Excluindo..."
          : "Excluir"}
      </button>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}