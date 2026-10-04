"use client";

import {
  useEffect,
  useState,
} from "react";

import { apiJson } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

type UserRole =
  | "USER"
  | "ADMIN";

type UserRoleSelectProps = {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;

  onRoleChange?: (
    newRole: UserRole,
  ) => void;
};

export default function UserRoleSelect({
  userId,
  currentRole,
  disabled = false,
  onRoleChange,
}: UserRoleSelectProps) {
  const { token } = useAuth();

  const [role, setRole] =
    useState<UserRole>(
      currentRole,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  async function handleChange(
    newRole: UserRole,
  ) {
    if (!token) {
      return;
    }

    const previousRole = role;

    setRole(newRole);
    setLoading(true);
    setError("");

    try {
      await apiJson(
        `/admin/users/${userId}/role`,
        {
          method: "PATCH",
          token,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            role: newRole,
          }),
        },
      );

      onRoleChange?.(
        newRole,
      );
    } catch (error) {
      setRole(
        previousRole,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a função.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-role-control">
      <select
        className="admin-role-select"
        value={role}
        disabled={
          disabled ||
          loading
        }
        onChange={(event) =>
          handleChange(
            event.target
              .value as UserRole,
          )
        }
      >
        <option value="USER">
          Usuário
        </option>

        <option value="ADMIN">
          Administrador
        </option>
      </select>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}
    </div>
  );
}