"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiJson } from "../lib/api";

type FilterItem = {
  id: number;
  name: string;
};

type FiltersResponse = {
  genres: FilterItem[];
  platforms: FilterItem[];
};

type GameFiltersProps = {
  genre?: string;
  platform?: string;
};

export default function GameFilters({
  genre = "",
  platform = "",
}: GameFiltersProps) {
  const router = useRouter();

  const [genres, setGenres] = useState<FilterItem[]>([]);
  const [platforms, setPlatforms] = useState<FilterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFilters() {
      try {
        const data = await apiJson<{
  genres: {
    id: number;
    name: string;
  }[];

  platforms: {
    id: number;
    name: string;
  }[];
}>(
  "/games/filters",
);

        setGenres(data.genres);
        setPlatforms(data.platforms);
      } catch {
        setGenres([]);
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    }

    loadFilters();
  }, []);

  function updateFilter(
    type: "genre" | "platform",
    value: string,
  ) {
    const params =
      new URLSearchParams(window.location.search);

    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }

    // Sempre volta para a primeira página
    // quando o usuário altera um filtro.
    params.delete("page");

    const queryString = params.toString();

    router.push(
      queryString
        ? `?${queryString}`
        : window.location.pathname,
    );
  }

  function clearFilters() {
    const params =
      new URLSearchParams(window.location.search);

    params.delete("genre");
    params.delete("platform");
    params.delete("page");

    const queryString = params.toString();

    router.push(
      queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname,
    );
  }

  if (loading) {
    return (
      <div className="game-filters">
        <span>Carregando filtros...</span>
      </div>
    );
  }

  return (
    <div className="game-filters">
      <select
        value={genre}
        onChange={(event) =>
          updateFilter(
            "genre",
            event.target.value,
          )
        }
      >
        <option value="">
          Todos os gêneros
        </option>

        {genres.map((item) => (
          <option
            key={item.id}
            value={item.name}
          >
            {item.name}
          </option>
        ))}
      </select>

      <select
        value={platform}
        onChange={(event) =>
          updateFilter(
            "platform",
            event.target.value,
          )
        }
      >
        <option value="">
          Todas as plataformas
        </option>

        {platforms.map((item) => (
          <option
            key={item.id}
            value={item.name}
          >
            {item.name}
          </option>
        ))}
      </select>

      {(genre || platform) && (
        <button
          type="button"
          onClick={clearFilters}
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}