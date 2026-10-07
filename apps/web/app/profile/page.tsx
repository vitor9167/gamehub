"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { apiJson } from "../../lib/api";

type User = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;

  isProfilePublic: boolean;
  isLibraryPublic: boolean;
};

export default function ProfilePage() {
  const router = useRouter();

  const {
    user: authUser,
    token,
    loading: authLoading,
    refreshUser,
  } = useAuth();

  const [user, setUser] =
    useState<User | null>(null);

  const [
    displayName,
    setDisplayName,
  ] = useState("");

  const [bio, setBio] =
    useState("");

  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState("");

  const [
    isProfilePublic,
    setIsProfilePublic,
  ] = useState(true);

  const [
    isLibraryPublic,
    setIsLibraryPublic,
  ] = useState(true);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authUser || !token) {
      router.replace("/login");
      return;
    }

    async function loadProfile() {
      try {
        const data =
          await apiJson<User>(
            "/auth/me",
            {
              token,
            },
          );

        setUser(data);

        setDisplayName(
          data.displayName ?? "",
        );

        setBio(
          data.bio ?? "",
        );

        setAvatarUrl(
          data.avatarUrl ?? "",
        );

        setIsProfilePublic(
          data.isProfilePublic,
        );

        setIsLibraryPublic(
          data.isLibraryPublic,
        );

        setError("");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o perfil.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [
    authLoading,
    authUser,
    token,
    router,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setMessage(
        "Você precisa estar logado.",
      );

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data =
        await apiJson<User>(
          "/auth/me",
          {
            method: "PATCH",

            token,

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              displayName:
                displayName.trim() ||
                undefined,

              bio:
                bio.trim() ||
                undefined,

              avatarUrl:
                avatarUrl.trim() ||
                undefined,

              isProfilePublic,

              isLibraryPublic:
                isProfilePublic
                  ? isLibraryPublic
                  : false,
            }),
          },
        );

      setUser(data);

      setDisplayName(
        data.displayName ?? "",
      );

      setBio(
        data.bio ?? "",
      );

      setAvatarUrl(
        data.avatarUrl ?? "",
      );

      setIsProfilePublic(
        data.isProfilePublic,
      );

      setIsLibraryPublic(
        data.isLibraryPublic,
      );

      await refreshUser();

      setMessage(
        "Perfil atualizado com sucesso.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setPasswordMessage(
        "Você precisa estar logado.",
      );

      return;
    }

    setChangingPassword(true);
    setPasswordMessage("");

    try {
      await apiJson(
        "/auth/change-password",
        {
          method: "PATCH",

          token,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
      );

      setCurrentPassword("");
      setNewPassword("");

      setPasswordMessage(
        "Senha alterada com sucesso.",
      );
    } catch (error) {
      setPasswordMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a senha.",
      );
    } finally {
      setChangingPassword(false);
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
            Carregando perfil...
          </p>
        </section>
      </main>
    );
  }

  if (
    !authUser ||
    !token
  ) {
    return null;
  }

  if (
    error ||
    !user
  ) {
    return (
      <main>
        <Header />

        <section>
          <p>
            {error ||
              "Não foi possível carregar o perfil."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Header />

      <section className="profile-page">
        <div className="profile-header">
          {avatarUrl ? (
            <img
              className="profile-avatar"
              src={avatarUrl}
              alt={`Avatar de ${
                displayName ||
                user.username
              }`}
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {(
                displayName ||
                user.username
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div>
            <h2>
              {displayName ||
                user.username}
            </h2>

            <p>
              @{user.username}
            </p>
          </div>
        </div>

        <div className="profile-section">
          <h3>
            Informações do perfil
          </h3>

          <p className="profile-section-description">
            Atualize seu nome de
            exibição, bio e imagem
            de perfil.
          </p>

          <form
            className="profile-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              Nome de exibição

              <input
                type="text"
                value={
                  displayName
                }
                onChange={(
                  event,
                ) =>
                  setDisplayName(
                    event.target
                      .value,
                  )
                }
                maxLength={100}
              />
            </label>

            <label>
              Bio

              <textarea
                value={bio}
                onChange={(
                  event,
                ) =>
                  setBio(
                    event.target
                      .value,
                  )
                }
                maxLength={500}
                rows={5}
              />
            </label>

            <label>
              URL do avatar

              <input
                type="url"
                value={
                  avatarUrl
                }
                onChange={(
                  event,
                ) =>
                  setAvatarUrl(
                    event.target
                      .value,
                  )
                }
                placeholder="https://..."
              />
            </label>

            <div className="profile-readonly">
              <div>
                <strong>
                  Email
                </strong>

                <p>
                  {user.email}
                </p>
              </div>

              <div>
                <strong>
                  Membro desde
                </strong>

                <p>
                  {new Date(
                    user.createdAt,
                  ).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
            </div>

            <div className="profile-privacy">
              <h3>
                Privacidade
              </h3>

              <label className="profile-privacy-option">
                <input
                  type="checkbox"
                  checked={
                    isProfilePublic
                  }
                  onChange={(
                    event,
                  ) => {
                    const checked =
                      event.target
                        .checked;

                    setIsProfilePublic(
                      checked,
                    );

                    if (!checked) {
                      setIsLibraryPublic(
                        false,
                      );
                    }
                  }}
                />

                <div>
                  <strong>
                    Perfil público
                  </strong>

                  <span>
                    Permite que
                    outros usuários
                    encontrem e
                    visualizem seu
                    perfil.
                  </span>
                </div>
              </label>

              <label className="profile-privacy-option">
                <input
                  type="checkbox"
                  checked={
                    isLibraryPublic
                  }
                  onChange={(
                    event,
                  ) =>
                    setIsLibraryPublic(
                      event.target
                        .checked,
                    )
                  }
                  disabled={
                    !isProfilePublic
                  }
                />

                <div>
                  <strong>
                    Exibir minha
                    biblioteca
                  </strong>

                  <span>
                    Permite que
                    outros usuários
                    vejam os jogos
                    da sua
                    biblioteca.
                  </span>
                </div>
              </label>
            </div>

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
          </form>
        </div>

        <div className="password-section">
          <h3>
            Segurança
          </h3>

          <p className="profile-section-description">
            Altere sua senha de
            acesso ao GameHub.
          </p>

          <form
            className="profile-form"
            onSubmit={
              handleChangePassword
            }
          >
            <label>
              Senha atual

              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={(
                  event,
                ) =>
                  setCurrentPassword(
                    event.target
                      .value,
                  )
                }
                minLength={6}
                autoComplete="current-password"
                required
              />
            </label>

            <label>
              Nova senha

              <input
                type="password"
                value={
                  newPassword
                }
                onChange={(
                  event,
                ) =>
                  setNewPassword(
                    event.target
                      .value,
                  )
                }
                minLength={6}
                autoComplete="new-password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={
                changingPassword
              }
            >
              {changingPassword
                ? "Alterando..."
                : "Alterar senha"}
            </button>

            {passwordMessage && (
              <p className="profile-message">
                {
                  passwordMessage
                }
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}