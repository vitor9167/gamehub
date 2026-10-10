"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "../contexts/AuthContext";

type AspectType =
  | "STORY"
  | "GAMEPLAY"
  | "MECHANICS"
  | "ATMOSPHERE"
  | "EXPLORATION"
  | "PROGRESSION"
  | "DIFFICULTY"
  | "MULTIPLAYER"
  | "ART_STYLE"
  | "SOUNDTRACK";

type RecommendationAspect = {
  id: string;
  type: AspectType;
};

type RecommendationUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

type RecommendedGame = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

type Recommendation = {
  id: string;
  body: string;
  createdAt: string;

  user: RecommendationUser;

  recommendedGame:
    RecommendedGame;

    supportCount: number;
    supportedByMe: boolean;

  aspects:
    RecommendationAspect[];
};

type SearchGame = {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
};

type GamesResponse = {
  items: SearchGame[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type GameRecommendationsProps = {
  gameId: string;
  gameTitle: string;
};

const aspectOptions: {
  type: AspectType;
  label: string;
}[] = [
  {
    type: "STORY",
    label: "História",
  },
  {
    type: "GAMEPLAY",
    label: "Gameplay",
  },
  {
    type: "MECHANICS",
    label: "Mecânicas",
  },
  {
    type: "ATMOSPHERE",
    label: "Atmosfera / Feeling",
  },
  {
    type: "EXPLORATION",
    label: "Exploração",
  },
  {
    type: "PROGRESSION",
    label: "Progressão",
  },
  {
    type: "DIFFICULTY",
    label: "Dificuldade",
  },
  {
    type: "MULTIPLAYER",
    label: "Multiplayer",
  },
  {
    type: "ART_STYLE",
    label: "Visual / Arte",
  },
  {
    type: "SOUNDTRACK",
    label: "Trilha sonora",
  },
];


const aspectLabels: Record<
  AspectType,
  string
> = Object.fromEntries(
  aspectOptions.map(
    (aspect) => [
      aspect.type,
      aspect.label,
    ],
  ),
) as Record<
  AspectType,
  string
>;

export default function GameRecommendations({
  gameId,
  gameTitle,
}: GameRecommendationsProps) {
  const router =
    useRouter();

  const {
    token,
    user,
  } = useAuth();

  const [
    recommendations,
    setRecommendations,
  ] = useState<
    Recommendation[]
  >([]);

  const [
  supportingId,
  setSupportingId,
] = useState<
  string | null
>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState<
    SearchGame[]
  >([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    selectedGame,
    setSelectedGame,
  ] = useState<
    SearchGame | null
  >(null);

  const [
    selectedAspects,
    setSelectedAspects,
  ] = useState<
    AspectType[]
  >([]);

  const [
    body,
    setBody,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState<
    string | null
  >(null);

  const [
    editBody,
    setEditBody,
  ] = useState("");

  const [
    editAspects,
    setEditAspects,
  ] = useState<
    AspectType[]
  >([]);

  const [
    editError,
    setEditError,
  ] = useState("");

  const [
    savingEdit,
    setSavingEdit,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const API_URL =
    process.env
      .NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  async function loadRecommendations() {
  try {
    setLoading(true);

    const endpoint =
      token
        ? `/recommendations/game/${gameId}/me`
        : `/recommendations/game/${gameId}`;

    const response =
      await fetch(
        `${API_URL}${endpoint}`,
        {
          cache:
            "no-store",

          headers:
            token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : undefined,
        },
      );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar as recomendações.",
      );
    }

    const data =
      (await response.json()) as Recommendation[];

    setRecommendations(
      data,
    );

    setError("");
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Não foi possível carregar as recomendações.",
    );
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadRecommendations();
}, [
  gameId,
  token,
]);

  function handleOpenForm() {
    if (
      !token ||
      !user
    ) {
      router.push(
        "/login",
      );

      return;
    }

    setFormOpen(true);
    setFormError("");
  }

  function handleCloseForm() {
    setFormOpen(false);

    setSearch("");
    setSearchResults([]);
    setSelectedGame(null);

    setSelectedAspects([]);
    setBody("");

    setFormError("");
  }

  async function handleSearchGames() {
    const cleanSearch =
      search.trim();

    if (
      cleanSearch.length <
      2
    ) {
      setFormError(
        "Digite pelo menos 2 caracteres para buscar um jogo.",
      );

      return;
    }

    try {
      setSearching(true);
      setFormError("");

      const params =
        new URLSearchParams({
          search:
            cleanSearch,
          page: "1",
          limit: "8",
        });

      const response =
        await fetch(
          `${API_URL}/games?${params.toString()}`,
          {
            cache:
              "no-store",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Não foi possível buscar os jogos.",
        );
      }

      const data =
        (await response.json()) as GamesResponse;

      const filtered =
        data.items.filter(
          (game) =>
            game.id !==
            gameId,
        );

      setSearchResults(
        filtered,
      );

      if (
        filtered.length ===
        0
      ) {
        setFormError(
          "Nenhum outro jogo encontrado.",
        );
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível buscar os jogos.",
      );
    } finally {
      setSearching(false);
    }
  }

  async function handleToggleSupport(
  recommendation:
    Recommendation,
) {
  if (
    !token ||
    !user
  ) {
    router.push(
      "/login",
    );

    return;
  }

  if (
    recommendation.user.id ===
    user.id
  ) {
    return;
  }

  try {
    setSupportingId(
      recommendation.id,
    );

    const method =
      recommendation.supportedByMe
        ? "DELETE"
        : "POST";

    const response =
      await fetch(
        `${API_URL}/recommendations/${recommendation.id}/support`,
        {
          method,

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        },
      );

    if (!response.ok) {
      const data =
        await response
          .json()
          .catch(
            () => null,
          );

      const message =
        Array.isArray(
          data?.message,
        )
          ? data.message.join(
              ", ",
            )
          : data?.message;

      throw new Error(
        message ||
          "Não foi possível atualizar a recomendação.",
      );
    }

    const data =
      (await response.json()) as {
        supportCount: number;
        supportedByMe: boolean;
      };

    setRecommendations(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            recommendation.id
              ? {
                  ...item,

                  supportCount:
                    data.supportCount,

                  supportedByMe:
                    data.supportedByMe,
                }
              : item,
        ),
    );
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Não foi possível atualizar a recomendação.",
    );
  } finally {
    setSupportingId(null);
  }
}

  function toggleAspect(
    type: AspectType,
  ) {
    setSelectedAspects(
      (current) => {
        if (
          current.includes(
            type,
          )
        ) {
          return current.filter(
            (item) =>
              item !==
              type,
          );
        }

        return [
          ...current,
          type,
        ];
      },
    );
  }

  function toggleEditAspect(
    type: AspectType,
  ) {
    setEditAspects(
      (current) => {
        if (
          current.includes(
            type,
          )
        ) {
          return current.filter(
            (item) =>
              item !==
              type,
          );
        }

        return [
          ...current,
          type,
        ];
      },
    );
  }

  async function handleSubmitRecommendation(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!token) {
      router.push(
        "/login",
      );

      return;
    }

    if (!selectedGame) {
      setFormError(
        "Selecione o jogo que deseja recomendar.",
      );

      return;
    }

    if (
      selectedAspects.length ===
      0
    ) {
      setFormError(
        "Selecione pelo menos um aspecto em comum.",
      );

      return;
    }

    const cleanBody =
      body.trim();

    if (
      cleanBody.length <
      10
    ) {
      setFormError(
        "Explique sua recomendação usando pelo menos 10 caracteres.",
      );

      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const response =
        await fetch(
          `${API_URL}/recommendations`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                sourceGameId:
                  gameId,

                recommendedGameId:
                  selectedGame.id,

                body:
                  cleanBody,

                aspects:
                  selectedAspects,
              }),
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => null,
            );

        const message =
          Array.isArray(
            data?.message,
          )
            ? data.message.join(
                ", ",
              )
            : data?.message;

        throw new Error(
          message ||
            "Não foi possível publicar a recomendação.",
        );
      }

      handleCloseForm();

      await loadRecommendations();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar a recomendação.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleStartEdit(
    recommendation:
      Recommendation,
  ) {
    setEditingId(
      recommendation.id,
    );

    setEditBody(
      recommendation.body,
    );

    setEditAspects(
      recommendation.aspects.map(
        (aspect) =>
          aspect.type,
      ),
    );

    setEditError("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditBody("");
    setEditAspects([]);
    setEditError("");
  }

  async function handleSaveEdit(
    recommendationId: string,
  ) {
    if (!token) {
      router.push(
        "/login",
      );

      return;
    }

    const cleanBody =
      editBody.trim();

    if (
      cleanBody.length <
      10
    ) {
      setEditError(
        "Explique sua recomendação usando pelo menos 10 caracteres.",
      );

      return;
    }

    if (
      editAspects.length ===
      0
    ) {
      setEditError(
        "Selecione pelo menos um aspecto em comum.",
      );

      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");

      const response =
        await fetch(
          `${API_URL}/recommendations/${recommendationId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                body:
                  cleanBody,

                aspects:
                  editAspects,
              }),
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => null,
            );

        const message =
          Array.isArray(
            data?.message,
          )
            ? data.message.join(
                ", ",
              )
            : data?.message;

        throw new Error(
          message ||
            "Não foi possível atualizar a recomendação.",
        );
      }

      const updatedRecommendation =
        (await response.json()) as Recommendation;

      setRecommendations(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              recommendationId
                ? updatedRecommendation
                : item,
          ),
      );

      handleCancelEdit();
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a recomendação.",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(
    recommendationId: string,
  ) {
    if (!token) {
      router.push(
        "/login",
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Deseja realmente excluir esta recomendação?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        recommendationId,
      );

      const response =
        await fetch(
          `${API_URL}/recommendations/${recommendationId}`,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(
              () => null,
            );

        const message =
          Array.isArray(
            data?.message,
          )
            ? data.message.join(
                ", ",
              )
            : data?.message;

        throw new Error(
          message ||
            "Não foi possível excluir a recomendação.",
        );
      }

      setRecommendations(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              recommendationId,
          ),
      );

      if (
        editingId ===
        recommendationId
      ) {
        handleCancelEdit();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a recomendação.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="game-recommendations">
      <div className="recommendations-header">
        <div>
          <span className="recommendations-eyebrow">
            Comunidade
          </span>

          <h2>
            Jogos recomendados
          </h2>

          <p>
            Jogos que outros
            usuários recomendam
            para quem gostou de{" "}
            <strong>
              {gameTitle}
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          className="recommend-game-button"
          onClick={
            handleOpenForm
          }
        >
          + Recomendar um jogo
        </button>
      </div>

      {formOpen && (
        <div className="recommendation-form-card">
          <div className="recommendation-form-header">
            <div>
              <span className="recommendations-eyebrow">
                Nova recomendação
              </span>

              <h3>
                Recomendar um
                jogo
              </h3>

              <p>
                Escolha um jogo
                parecido com{" "}
                <strong>
                  {gameTitle}
                </strong>
                .
              </p>
            </div>

            <button
              type="button"
              className="recommendation-close-button"
              onClick={
                handleCloseForm
              }
              aria-label="Fechar formulário"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={
              handleSubmitRecommendation
            }
          >
            {!selectedGame ? (
              <>
                <label className="recommendation-field">
                  <span>
                    Buscar jogo
                  </span>

                  <div className="recommendation-search-row">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            event.stopPropagation();

                            void handleSearchGames();
                          }
                        }}
                      placeholder="Ex.: Cyberpunk 2077"
                    />

                    <button
                      type="button"
                      disabled={
                        searching
                      }
                      onClick={
                        handleSearchGames
                      }
                    >
                      {searching
                        ? "Buscando..."
                        : "Buscar"}
                    </button>
                  </div>
                </label>

                {searchResults.length >
                  0 && (
                  <div className="recommendation-game-results">
                    {searchResults.map(
                      (
                        game,
                      ) => (
                        <button
                          type="button"
                          key={
                            game.id
                          }
                          className="recommendation-game-result"
                          onClick={() => {
                            setSelectedGame(
                              game,
                            );

                            setSearchResults(
                              [],
                            );

                            setFormError(
                              "",
                            );
                          }}
                        >
                          {game.coverUrl ? (
                            <img
                              src={
                                game.coverUrl
                              }
                              alt={`Capa de ${game.title}`}
                            />
                          ) : (
                            <div className="recommendation-result-no-cover">
                              Sem capa
                            </div>
                          )}

                          <span>
                            {
                              game.title
                            }
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="recommendation-selected-game">
                {selectedGame.coverUrl ? (
                  <img
                    src={
                      selectedGame.coverUrl
                    }
                    alt={`Capa de ${selectedGame.title}`}
                  />
                ) : (
                  <div className="recommendation-result-no-cover">
                    Sem capa
                  </div>
                )}

                <div>
                  <span>
                    Jogo recomendado
                  </span>

                  <strong>
                    {
                      selectedGame.title
                    }
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGame(
                      null,
                    );

                    setSearch(
                      "",
                    );
                  }}
                >
                  Trocar
                </button>
              </div>
            )}

            {selectedGame && (
              <>
                <div className="recommendation-field">
                  <span>
                    O que os jogos
                    têm em comum?
                  </span>

                  <div className="recommendation-aspect-options">
                    {aspectOptions.map(
                      (
                        aspect,
                      ) => {
                        const selected =
                          selectedAspects.includes(
                            aspect.type,
                          );

                        return (
                          <button
                            type="button"
                            key={
                              aspect.type
                            }
                            className={
                              selected
                                ? "selected"
                                : ""
                            }
                            onClick={() =>
                              toggleAspect(
                                aspect.type,
                              )
                            }
                          >
                            {
                              aspect.label
                            }
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                <label className="recommendation-field">
                  <span>
                    Por que você
                    recomenda este
                    jogo?
                  </span>

                  <textarea
                    value={
                      body
                    }
                    onChange={(
                      event,
                    ) =>
                      setBody(
                        event
                          .target
                          .value,
                      )
                    }
                    rows={6}
                    maxLength={
                      2000
                    }
                    placeholder={`Explique por que quem gostou de ${gameTitle} também pode gostar de ${selectedGame.title}.`}
                  />

                  <small>
                    {body.length}
                    /2000
                  </small>
                </label>
              </>
            )}

            {formError && (
              <p className="error-message">
                {formError}
              </p>
            )}

            {selectedGame && (
              <div className="recommendation-form-actions">
                <button
                  type="button"
                  onClick={
                    handleCloseForm
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="recommendation-submit-button"
                >
                  {submitting
                    ? "Publicando..."
                    : "Publicar recomendação"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {loading && (
        <p>
          Carregando
          recomendações...
        </p>
      )}

      {!loading &&
        error && (
          <div className="empty-state">
            {error}
          </div>
        )}

      {!loading &&
        !error &&
        recommendations.length ===
          0 && (
          <div className="empty-state">
            <p>
              Ainda não existem
              recomendações para
              este jogo.
            </p>

            <span>
              Seja o primeiro a
              recomendar um jogo
              parecido.
            </span>
          </div>
        )}

      {!loading &&
        !error &&
        recommendations.length >
          0 && (
          <div className="recommendations-list">
            {recommendations.map(
              (
                recommendation,
              ) => {
                const isOwner =
                  user?.id ===
                  recommendation
                    .user
                    .id;

                const isEditing =
                  editingId ===
                  recommendation
                    .id;

                return (
                  <article
                    key={
                      recommendation.id
                    }
                    className="recommendation-card"
                  >
                    <div className="recommendation-user">
                      <a
                        href={`/users/${recommendation.user.username}`}
                      >
                        {recommendation
                          .user
                          .avatarUrl ? (
                          <img
                            src={
                              recommendation
                                .user
                                .avatarUrl
                            }
                            alt={`Avatar de ${recommendation.user.username}`}
                          />
                        ) : (
                          <div className="recommendation-user-placeholder">
                            {(recommendation
                              .user
                              .displayName ||
                              recommendation
                                .user
                                .username)
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong>
                            {recommendation
                              .user
                              .displayName ||
                              recommendation
                                .user
                                .username}
                          </strong>

                          <span>
                            @
                            {
                              recommendation
                                .user
                                .username
                            }
                          </span>
                        </div>
                      </a>

                      <div className="recommendation-card-top-actions">
                        <time>
                          {new Date(
                            recommendation.createdAt,
                          ).toLocaleDateString(
                            "pt-BR",
                          )}
                        </time>

                        {isOwner &&
                          !isEditing && (
                            <div className="recommendation-owner-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    recommendation,
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                disabled={
                                  deletingId ===
                                  recommendation.id
                                }
                                className="danger"
                                onClick={() =>
                                  handleDelete(
                                    recommendation.id,
                                  )
                                }
                              >
                                {deletingId ===
                                recommendation.id
                                  ? "Excluindo..."
                                  : "Excluir"}
                              </button>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="recommendation-content">
                      <a
                        href={`/games/${recommendation.recommendedGame.slug}`}
                        className="recommendation-game-cover"
                      >
                        {recommendation
                          .recommendedGame
                          .coverUrl ? (
                          <img
                            src={
                              recommendation
                                .recommendedGame
                                .coverUrl
                            }
                            alt={`Capa de ${recommendation.recommendedGame.title}`}
                          />
                        ) : (
                          <div className="recommendation-no-cover">
                            Sem capa
                          </div>
                        )}
                      </a>

                      <div className="recommendation-main">
                        <span className="recommendation-label">
                          Recomendado
                        </span>

                        <a
                          href={`/games/${recommendation.recommendedGame.slug}`}
                          className="recommendation-game-title"
                        >
                          {
                            recommendation
                              .recommendedGame
                              .title
                          }
                        </a>

                        {isEditing ? (
                          <div className="recommendation-edit-form">
                            <div className="recommendation-field">
                              <span>
                                Aspectos
                                em comum
                              </span>

                              <div className="recommendation-aspect-options">
                                {aspectOptions.map(
                                  (
                                    aspect,
                                  ) => {
                                    const selected =
                                      editAspects.includes(
                                        aspect.type,
                                      );

                                    return (
                                      <button
                                        type="button"
                                        key={
                                          aspect.type
                                        }
                                        className={
                                          selected
                                            ? "selected"
                                            : ""
                                        }
                                        onClick={() =>
                                          toggleEditAspect(
                                            aspect.type,
                                          )
                                        }
                                      >
                                        {
                                          aspect.label
                                        }
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            </div>

                            <label className="recommendation-field">
                              <span>
                                Sua recomendação
                              </span>

                              <textarea
                                value={
                                  editBody
                                }
                                onChange={(
                                  event,
                                ) =>
                                  setEditBody(
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                rows={6}
                                maxLength={
                                  2000
                                }
                              />

                              <small>
                                {
                                  editBody.length
                                }
                                /2000
                              </small>
                            </label>

                            {editError && (
                              <p className="error-message">
                                {
                                  editError
                                }
                              </p>
                            )}

                            <div className="recommendation-form-actions">
                              <button
                                type="button"
                                disabled={
                                  savingEdit
                                }
                                onClick={
                                  handleCancelEdit
                                }
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                disabled={
                                  savingEdit
                                }
                                className="recommendation-submit-button"
                                onClick={() =>
                                  handleSaveEdit(
                                    recommendation.id,
                                  )
                                }
                              >
                                {savingEdit
                                  ? "Salvando..."
                                  : "Salvar alterações"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="recommendation-aspects">
                              {recommendation.aspects.map(
                                (
                                  aspect,
                                ) => (
                                  <span
                                    key={
                                      aspect.id
                                    }
                                  >
                                    {
                                      aspectLabels[
                                        aspect.type
                                      ]
                                    }
                                  </span>
                                ),
                              )}
                            </div>

                            <p className="recommendation-body">
                              {
                                recommendation.body
                              }
                            </p>

                           <div className="recommendation-support">
                                {user?.id !==
                                    recommendation.user.id && (
                                    <button
                                    type="button"
                                    className={
                                        recommendation.supportedByMe
                                        ? "active"
                                        : ""
                                    }
                                    disabled={
                                        supportingId ===
                                        recommendation.id
                                    }
                                    onClick={() =>
                                        handleToggleSupport(
                                        recommendation,
                                        )
                                    }
                                    >
                                    {supportingId ===
                                    recommendation.id
                                        ? "Atualizando..."
                                        : recommendation.supportedByMe
                                        ? "Recomendado ✓"
                                        : "Recomendar"}
                                    </button>
                                )}

                                <span>
                                    {recommendation.supportCount}{" "}
                                    {recommendation.supportCount ===
                                    1
                                    ? "pessoa também recomenda"
                                    : "pessoas também recomendam"}
                                </span>
                                </div>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
    </section>
  );
}