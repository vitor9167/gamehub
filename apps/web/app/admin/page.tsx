"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../components/Header";

import { useAuth } from "../../contexts/AuthContext";
import { apiJson } from "../../lib/api";

type AdminStats = {
  users: number;
  games: number;
  genres: number;
  platforms: number;
};

export default function AdminPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [stats, setStats] =
    useState<AdminStats | null>(null);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || !token) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/");
      return;
    }

    async function loadStats() {
      try {
        const data =
          await apiJson<AdminStats>(
            "/admin/stats",
            {
              token,
            },
          );

        setStats(data);
        setError("");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados administrativos.",
        );
      } finally {
        setStatsLoading(false);
      }
    }

    loadStats();
  }, [
    authLoading,
    user,
    token,
    router,
  ]);

  if (
    authLoading ||
    statsLoading
  ) {
    return (
      <main>
        <Header />

        <section>
          <p>
            Carregando painel administrativo...
          </p>
        </section>
      </main>
    );
  }

  if (!user || !token) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return null;
  }

  return (
  <main>
    <Header />

    <section>
      <div className="admin-dashboard">
        <div className="admin-dashboard-header">
          <div>
            <h1>
              Administração
            </h1>

            <p>
              Gerencie usuários, catálogo
              e informações do GameHub.
            </p>
          </div>
        </div>

        {error ? (
          <p className="feedback-message feedback-error">
            {error}
          </p>
        ) : stats ? (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <strong>
                {stats.users}
              </strong>

              <span>
                Usuários
              </span>
            </div>

            <div className="admin-stat-card">
              <strong>
                {stats.games}
              </strong>

              <span>
                Jogos
              </span>
            </div>

            <div className="admin-stat-card">
              <strong>
                {stats.genres}
              </strong>

              <span>
                Gêneros
              </span>
            </div>

            <div className="admin-stat-card">
              <strong>
                {stats.platforms}
              </strong>

              <span>
                Plataformas
              </span>
            </div>
          </div>
        ) : null}

        <div className="admin-section">
          <div className="admin-section-header">
            <h3>
              Gerenciamento
            </h3>

            <p>
              Acesse as principais
              ferramentas administrativas.
            </p>
          </div>

          <div className="admin-grid">
            <a
              href="/admin/users"
              className="admin-card"
            >
              <h3>
                Usuários
              </h3>

              <p>
                Visualize usuários
                cadastrados e gerencie
                suas permissões.
              </p>
            </a>

            <a
              href="/admin/games"
              className="admin-card"
            >
              <h3>
                Gerenciar jogos
              </h3>

              <p>
                Edite e remova jogos
                cadastrados no catálogo.
              </p>
            </a>

            <a
              href="/games/import"
              className="admin-card"
            >
              <h3>
                Importar jogos
              </h3>

              <p>
                Pesquise jogos na IGDB
                e adicione-os ao GameHub.
              </p>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
)};