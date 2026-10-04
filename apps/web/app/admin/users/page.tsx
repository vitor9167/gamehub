"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import UserRoleSelect from "../../../components/UserRoleSelect";

import { useAuth } from "../../../contexts/AuthContext";
import { apiJson } from "../../../lib/api";

type AdminUser = {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [usersLoading, setUsersLoading] =
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

    async function loadUsers() {
      try {
        const data =
          await apiJson<AdminUser[]>(
            "/admin/users",
            {
              token,
            },
          );

        setUsers(data);
        setError("");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os usuários.",
        );
      } finally {
        setUsersLoading(false);
      }
    }

    loadUsers();
  }, [
    authLoading,
    user,
    token,
    router,
  ]);

  function handleRoleChange(
    userId: string,
    newRole: "USER" | "ADMIN",
  ) {
    setUsers((current) =>
      current.map((item) => {
        if (item.id !== userId) {
          return item;
        }

        return {
          ...item,
          role: newRole,
        };
      }),
    );
  }

  if (
    authLoading ||
    usersLoading
  ) {
    return (
      <main>
        <Header />

        <section>
          <p>
            Carregando usuários...
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
        <div className="admin-page-header">
          <div>
            <h2>
              Usuários
            </h2>

            <p>
              Gerencie os usuários
              cadastrados e suas
              permissões.
            </p>
          </div>

          <span>
            {users.length}{" "}
            {users.length === 1
              ? "usuário"
              : "usuários"}
          </span>
        </div>

        {error ? (
          <p className="error-message">
            {error}
          </p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>
                    Usuário
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Nome
                  </th>

                  <th>
                    Função
                  </th>

                  <th>
                    Cadastro
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>
                        @{item.username}
                      </td>

                      <td>
                        {item.email}
                      </td>

                      <td>
                        {item.displayName ||
                          "-"}
                      </td>
                        
                         <td>
                            <span
                              className={
                                item.role === "ADMIN"
                                  ? "role-badge admin"
                                  : "role-badge user"
                              }
                            >
                              {item.role === "ADMIN"
                                ? "ADMIN"
                                : "USER"}
                            </span>

                            <UserRoleSelect
                              userId={item.id}
                              currentRole={item.role}
                              disabled={item.id === user.id}
                              onRoleChange={(newRole) =>
                                handleRoleChange(
                                  item.id,
                                  newRole,
                                )
                              }
                            />
                          </td>
                      <td>
                        {new Date(
                          item.createdAt,
                        ).toLocaleDateString(
                          "pt-BR",
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        {!error &&
          users.length === 0 && (
            <p>
              Nenhum usuário
              encontrado.
            </p>
          )}
      </section>
    </main>
  );
}