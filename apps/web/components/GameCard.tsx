import Link from "next/link";

type Game = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  releaseDate: string | null;

  genres: {
    id: number;
    name: string;
  }[];

  platforms: {
    id: number;
    name: string;
  }[];
};

type GameCardProps = {
  game: Game;
};

export default function GameCard({
  game,
}: GameCardProps) {
  return (
    <article className="game-card">
  <a
    href={`/games/${game.slug}`}
    className="game-card-link"
  >
    <div className="game-card-cover">
      {game.coverUrl ? (
        <img
          src={game.coverUrl}
          alt={`Capa de ${game.title}`}
        />
      ) : (
        <div className="game-card-no-cover">
          Sem capa
        </div>
      )}

      <div className="game-card-overlay">
        <span>
          Ver detalhes
        </span>
      </div>
    </div>

    <div className="game-card-content">
      <h3>
        {game.title}
      </h3>

      {game.releaseDate && (
        <span className="game-card-date">
          {new Date(
            game.releaseDate,
          ).toLocaleDateString(
            "pt-BR",
          )}
        </span>
      )}

      {game.genres.length > 0 && (
        <div className="game-card-genres">
          {game.genres
            .slice(0, 3)
            .map((genre) => (
              <span
                key={genre.id}
                className="game-card-tag"
              >
                {genre.name}
              </span>
            ))}
        </div>
      )}

      {game.description && (
        <p className="game-card-description">
          {game.description}
        </p>
      )}

      <div className="game-card-platforms">
        {game.platforms.length > 0
          ? game.platforms
              .slice(0, 3)
              .map(
                (platform) =>
                  platform.name,
              )
              .join(" • ")
          : "Sem plataformas"}
      </div>
    </div>
  </a>
</article>
  );
}