"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type FavoriteLibraryButtonProps = {
  gameId: string;
  initialFavorite: boolean;
};

export default function FavoriteLibraryButton({
  gameId,
  initialFavorite,
}: FavoriteLibraryButtonProps) {
  const { token } = useAuth();

  const [isFavorite, setIsFavorite] =
    useState(initialFavorite);

  const [loading, setLoading] =
    useState(false);

  async function handleToggleFavorite() {
    if (!token || loading) {
      return;
    }

    setLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://localhost:4000";

      const response = await fetch(
        `${API_URL}/library/games/${gameId}/favorite`,
        {
          method: isFavorite
            ? "DELETE"
            : "PATCH",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

      const data =
        await response.json().catch(
          () => null,
        );

      if (!response.ok) {
        alert(
          data?.message ??
            "Não foi possível atualizar o favorito.",
        );

        return;
      }

      setIsFavorite(
        data.isFavorite,
      );
    } catch {
      alert(
        "Não foi possível atualizar o favorito.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={
        isFavorite
          ? "library-favorite-button active"
          : "library-favorite-button"
      }
      onClick={
        handleToggleFavorite
      }
      disabled={loading}
    >
      {loading
        ? "Atualizando..."
        : isFavorite
          ? "♥ Favorito"
          : "♡ Favoritar"}
    </button>
  );
}