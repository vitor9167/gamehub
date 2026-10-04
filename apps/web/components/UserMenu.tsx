"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function UserMenu() {
  const router = useRouter();

  const {
    user,
    loading,
    logout,
  } = useAuth();

  function handleLogout() {
    logout();

    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <a href="/login">
        Entrar
      </a>
    );
  }

  return (
    <div className="user-menu">
      <span>
        Olá, {user.displayName || user.username}
      </span>

      <button
        type="button"
        onClick={handleLogout}
      >
        Sair
      </button>
    </div>
  );
}