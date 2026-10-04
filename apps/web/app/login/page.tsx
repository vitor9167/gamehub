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

type LoginResponse = {
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

export default function LoginPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
    refreshUser,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
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
        await apiJson<LoginResponse>(
          "/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
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
          : "Não foi possível entrar.",
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
            Entrar
          </h2>

          <p>
            Acesse sua conta do GameHub.
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
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
                autoComplete="current-password"
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Entrando..."
                : "Entrar"}
            </button>

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}
          </form>

          <p>
            Ainda não tem conta?{" "}
            <a href="/register">
              Criar conta
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}