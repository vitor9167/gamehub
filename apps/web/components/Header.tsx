"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();

  const {
    user,
    loading,
    logout,
  } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

  function isActive(
    href: string,
  ) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href,
    );
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <Link
          href="/"
          className="header-logo"
        >
          GameHub
        </Link>

        <button
          type="button"
          className="header-menu-button"
          aria-label={
            menuOpen
              ? "Fechar menu"
              : "Abrir menu"
          }
          aria-expanded={
            menuOpen
          }
          onClick={() =>
            setMenuOpen(
              (current) =>
                !current,
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className={
            menuOpen
              ? "header-content open"
              : "header-content"
          }
        >
          <nav className="header-nav">
            <Link
              href="/"
              className={
                isActive("/")
                  ? "active"
                  : ""
              }
            >
              Home
            </Link>

            <Link
              href="/games"
              className={
                isActive("/games")
                  ? "active"
                  : ""
              }
            >
              Jogos
            </Link>

            {user && (
              <Link
                href="/library"
                className={
                  isActive(
                    "/library",
                  )
                    ? "active"
                    : ""
                }
              >
                Biblioteca
              </Link>
            )}

            {user && (
              <Link
                href="/profile"
                className={
                  isActive(
                    "/profile",
                  )
                    ? "active"
                    : ""
                }
              >
                Perfil
              </Link>
            )}

            {user?.role ===
              "ADMIN" && (
              <Link
                href="/admin"
                className={
                  isActive(
                    "/admin",
                  )
                    ? "active"
                    : ""
                }
              >
                Administração
              </Link>
            )}
          </nav>

          <div className="header-user">
            {loading ? (
              <span className="header-loading">
                Carregando...
              </span>
            ) : user ? (
              <>
                <div className="header-user-info">
                  <span>
                    Olá,
                  </span>

                  <strong>
                    {user.displayName ||
                      user.username}
                  </strong>
                </div>

                <button
                  type="button"
                  className="header-logout"
                  onClick={
                    handleLogout
                  }
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="header-auth-links">
                <Link
                  href="/login"
                  className="header-login"
                >
                  Entrar
                </Link>

                <Link
                  href="/register"
                  className="header-register"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}