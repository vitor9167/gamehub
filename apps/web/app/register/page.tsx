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

type RegisterResponse = {
  accessToken: string;

  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    role: "USER" | "ADMIN";
  };
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    refreshUser,
  } = useAuth();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [displayName, setDisplayName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user) {
      router.replace("/");
    }
  }, [
    authLoading,
    user,
    router,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data =
        await apiJson<RegisterResponse>(
          "/auth/register",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username,
              email,
              password,

              displayName:
                displayName.trim() ||
                undefined,
            }),
          },
        );

      localStorage.setItem(
        "gamehub_token",
        data.accessToken,
      );

      localStorage.setItem(
        "gamehub_user",
        JSON.stringify(data.user),
      );

      await refreshUser();

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main>
        <Header />

        <section>
          <p>
            Carregando...
          </p>
        </section>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main>
      <Header />

      <section className="auth-page">
        <div className="auth-card">
          <h2>
            Criar conta
          </h2>

          <p>
            Cadastre-se no GameHub.
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              Usuário

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                minLength={3}
                maxLength={30}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Nome de exibição

              <input
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(
                    event.target.value,
                  )
                }
                maxLength={100}
              />
            </label>

            <label>
              Email

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                autoComplete="email"
                required
              />
            </label>

            <label>
              Senha

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Criando conta..."
                : "Criar conta"}
            </button>

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}
          </form>

          <p>
            Já tem uma conta?{" "}
            <a href="/login">
              Entrar
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}