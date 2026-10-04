"use client";

import { FormEvent, useState } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

type SearchBarProps = {
  initialSearch?: string;
};

export default function SearchBar({
  initialSearch = "",
}: SearchBarProps) {
  const [search, setSearch] =
    useState(initialSearch);

  const router = useRouter();
  const pathname = usePathname();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const query = search.trim();

    const params =
      new URLSearchParams(window.location.search);

    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }

    // Uma nova busca sempre começa
    // pela primeira página.
    params.delete("page");

    const queryString = params.toString();

    router.push(
      queryString
        ? `${pathname}?${queryString}`
        : pathname,
    );
  }

  return (
    <form
      className="search-bar"
      onSubmit={handleSubmit}
    >
      <input
        type="search"
        placeholder="Pesquisar jogos..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
      />

      <button type="submit">
        Buscar
      </button>
    </form>
  );
}