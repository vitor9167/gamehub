import Header from "../../../../components/Header";
import UserFollowList from "../../../../components/UserFollowList";

type FollowUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type FollowingPageProps = {
  params: Promise<{
    username: string;
  }>;
};

async function getFollowing(
  username: string,
): Promise<FollowUser[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/following`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function FollowingPage({
  params,
}: FollowingPageProps) {
  const { username } =
    await params;

  const following =
    await getFollowing(username);

  return (
    <main>
      <Header />

      <section className="follow-page">
        <div className="follow-page-header">
          <div>
            <a
              href={`/users/${username}`}
              className="follow-page-back"
            >
              ← Voltar ao perfil
            </a>

            <h1>
              Seguindo
            </h1>

            <p>
              Pessoas seguidas por
              @{username}.
            </p>
          </div>

          <strong>
            {following.length}
          </strong>
        </div>

        <UserFollowList
          users={following}
          emptyMessage="Este usuário ainda não segue ninguém."
        />
      </section>
    </main>
  );
}