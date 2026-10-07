"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { apiJson } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type Review = {
  id: string;
  body: string;
  isSpoiler: boolean;
  createdAt: string;
  updatedAt: string;

  _count: {
    likes: number;
  };

  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;

    ratings: {
      score: number;
    }[];
  };
};

type GameReviewsProps = {
  gameId: string;
};

export default function GameReviews({
  gameId,
}: GameReviewsProps) {
  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [
    likedReviewIds,
    setLikedReviewIds,
  ] = useState<string[]>([]);

  const [body, setBody] =
    useState("");

  const [isSpoiler, setIsSpoiler] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function loadReviews() {
    try {
      const data =
        await apiJson<Review[]>(
          `/games/${gameId}/reviews`,
        );

      setReviews(data);

      if (user) {
        const myReview = data.find(
          (review) =>
            review.user.id ===
            user.id,
        );

        if (myReview) {
          setBody(myReview.body);

          setIsSpoiler(
            myReview.isSpoiler,
          );
        } else {
          setBody("");
          setIsSpoiler(false);
        }
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as reviews.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMyLikes() {
    if (!token) {
      setLikedReviewIds([]);
      return;
    }

    try {
      const data =
        await apiJson<string[]>(
          `/games/${gameId}/reviews/likes/me`,
          {
            token,
          },
        );

      setLikedReviewIds(data);
    } catch {
      setLikedReviewIds([]);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    setLoading(true);

    loadReviews();
    loadMyLikes();
  }, [
    authLoading,
    token,
    user,
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

    try {
      await apiJson(
        `/games/${gameId}/review`,
        {
          method: "POST",
          token,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            body,
            isSpoiler,
          }),
        },
      );

      setMessage(
        "Review salva com sucesso.",
      );

      await loadReviews();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a review.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReview() {
    if (!token) {
      return;
    }

    const confirmed =
      window.confirm(
        "Deseja realmente excluir sua review?",
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiJson(
        `/games/${gameId}/review`,
        {
          method: "DELETE",
          token,
        },
      );

      setBody("");
      setIsSpoiler(false);

      setMessage(
        "Review excluída com sucesso.",
      );

      await loadReviews();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a review.",
      );
    }
  }

  async function handleLike(
    reviewId: string,
  ) {
    if (!token) {
      setMessage(
        "Faça login para curtir uma review.",
      );

      return;
    }

    const isLiked =
      likedReviewIds.includes(
        reviewId,
      );

    try {
      await apiJson(
        `/games/reviews/${reviewId}/like`,
        {
          method: isLiked
            ? "DELETE"
            : "POST",

          token,
        },
      );

      setLikedReviewIds(
        (current) => {
          if (isLiked) {
            return current.filter(
              (id) =>
                id !== reviewId,
            );
          }

          return [
            ...current,
            reviewId,
          ];
        },
      );

      setReviews((current) =>
        current.map((review) => {
          if (
            review.id !== reviewId
          ) {
            return review;
          }

          return {
            ...review,

            _count: {
              ...review._count,

              likes: Math.max(
                0,
                review._count.likes +
                  (isLiked
                    ? -1
                    : 1),
              ),
            },
          };
        }),
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a curtida.",
      );
    }
  }

  if (authLoading || loading) {
    return (
      <section className="game-reviews">
        <p className="loading-state">
          Carregando reviews...
        </p>
      </section>
    );
  }

  const myReview = reviews.find(
    (review) =>
      review.user.id === user?.id,
  );

  return (
    <section className="game-reviews">
      <div className="reviews-header">
        <div>
          <h3>Reviews</h3>

          <p>
            Veja o que outros jogadores
            acharam deste jogo.
          </p>
        </div>

        <span>
          {reviews.length}{" "}
          {reviews.length === 1
            ? "review"
            : "reviews"}
        </span>
      </div>

      {user && token ? (
        <form
          className="review-form"
          onSubmit={handleSubmit}
        >
          <textarea
            value={body}
            onChange={(event) =>
              setBody(
                event.target.value,
              )
            }
            placeholder="Escreva sua opinião sobre o jogo..."
            rows={6}
            minLength={3}
            maxLength={5000}
            required
          />

          <div className="review-form-actions">
            <label className="review-spoiler-check">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(event) =>
                  setIsSpoiler(
                    event.target
                      .checked,
                  )
                }
              />

              <span>
                Minha review contém
                spoilers
              </span>
            </label>

            <div className="review-form-buttons">
              {myReview && (
                <button
                  type="button"
                  className="review-delete-button"
                  onClick={
                    handleDeleteReview
                  }
                >
                  Excluir
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : myReview
                    ? "Atualizar review"
                    : "Publicar review"}
              </button>
            </div>
          </div>

          {message && (
            <p className="feedback-message">
              {message}
            </p>
          )}
        </form>
      ) : (
        <p className="reviews-login-message">
          Faça login para escrever uma
          review.
        </p>
      )}

      <div className="review-list">
        {reviews.length === 0 ? (
          <div className="empty-state">
            Nenhuma review publicada
            ainda.
          </div>
        ) : (
          reviews.map((review) => {
            const userScore =
              review.user.ratings[0]
                ?.score ?? null;

            const isLiked =
              likedReviewIds.includes(
                review.id,
              );

            const authorName =
              review.user
                .displayName ||
              `@${review.user.username}`;

            return (
              <article
                key={review.id}
                className="review-card"
              >
                <div className="review-header">
                  <div className="review-user">
                    <a
                      href={`/users/${review.user.username}`}
                      className="review-user-link"
                    >
                      <strong>
                        {authorName}
                      </strong>
                    </a>

                    {userScore !==
                      null && (
                      <span className="review-rating">
                        {userScore}/10
                      </span>
                    )}
                  </div>

                  <time>
                    {new Date(
                      review.createdAt,
                    ).toLocaleDateString(
                      "pt-BR",
                    )}
                  </time>
                </div>

                {review.isSpoiler ? (
                  <details className="review-spoiler">
                    <summary>
                      Review contém
                      spoiler
                    </summary>

                    <p className="review-body">
                      {review.body}
                    </p>
                  </details>
                ) : (
                  <p className="review-body">
                    {review.body}
                  </p>
                )}

                <div className="review-footer">
                  <button
                    type="button"
                    className={
                      isLiked
                        ? "review-like-button liked"
                        : "review-like-button"
                    }
                    onClick={() =>
                      handleLike(
                        review.id,
                      )
                    }
                  >
                    {isLiked
                      ? "Curtido"
                      : "Curtir"}

                    <span>
                      {review._count.likes}
                    </span>
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}