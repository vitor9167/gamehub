"use client";

import {
  useEffect,
  useState,
} from "react";

import { apiJson } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type GameRatingProps = {
  gameId: string;
};

type RatingData = {
  userScore: number | null;
  averageScore: number | null;
  totalRatings: number;
};

export default function GameRating({
  gameId,
}: GameRatingProps) {
  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [rating, setRating] =
    useState<RatingData | null>(null);

  const [selectedScore, setSelectedScore] =
    useState("");

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

    async function loadRating() {
      try {
        const data =
          await apiJson<RatingData>(
            `/games/${gameId}/rating`,
            {
              token,
            },
          );

        setRating(data);

        if (data.userScore !== null) {
          setSelectedScore(
            String(data.userScore),
          );
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar a avaliação.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadRating();
  }, [
    authLoading,
    user,
    token,
    gameId,
  ]);

  async function handleRate() {
    if (!token || !selectedScore) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await apiJson(
        `/games/${gameId}/rating`,
        {
          method: "POST",
          token,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            score: Number(
              selectedScore,
            ),
          }),
        },
      );

      const data =
        await apiJson<RatingData>(
          `/games/${gameId}/rating`,
          {
            token,
          },
        );

      setRating(data);

      setMessage(
        "Avaliação salva com sucesso.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a avaliação.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <section className="game-rating">
        <p className="loading-state">
          Carregando avaliação...
        </p>
      </section>
    );
  }

  if (!user || !token) {
    return (
      <section className="game-rating">
        <h3>Avaliação</h3>

        <p className="rating-meta">
          Faça login para avaliar este jogo.
        </p>
      </section>
    );
  }

  const average =
    rating?.averageScore ?? null;

  const total =
    rating?.totalRatings ?? 0;

  return (
    <section className="game-rating">
      <h3>Avaliação</h3>

      <div className="rating-summary">
        <div className="rating-average">
          {average !== null
            ? average.toFixed(1)
            : "-"}
          <span>/10</span>
        </div>

        <div className="rating-meta">
          <strong>
            Nota média
          </strong>

          <span>
            {total}{" "}
            {total === 1
              ? "avaliação"
              : "avaliações"}
          </span>
        </div>
      </div>

      <p className="rating-label">
        Sua avaliação
      </p>

      <div className="rating-buttons">
        {Array.from(
          { length: 10 },
          (_, index) => index + 1,
        ).map((score) => {
          const active =
            selectedScore ===
            String(score);

          return (
            <button
              key={score}
              type="button"
              className={
                active
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedScore(
                  String(score),
                )
              }
              disabled={saving}
              aria-label={`Avaliar com ${score}`}
            >
              {score}
            </button>
          );
        })}
      </div>

      <div className="rating-actions">
        <button
          type="button"
          className="rating-save-button"
          onClick={handleRate}
          disabled={
            saving ||
            !selectedScore
          }
        >
          {saving
            ? "Salvando..."
            : rating?.userScore
              ? "Atualizar avaliação"
              : "Salvar avaliação"}
        </button>

        {rating?.userScore !== null &&
          rating?.userScore !==
            undefined && (
            <span className="rating-current">
              Sua nota atual:{" "}
              <strong>
                {rating.userScore}/10
              </strong>
            </span>
          )}
      </div>

      {message && (
        <p className="feedback-message">
          {message}
        </p>
      )}
    </section>
  );
}