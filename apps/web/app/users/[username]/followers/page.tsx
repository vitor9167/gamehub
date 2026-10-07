import Header from "../../../../components/Header";
import UserFollowList from "../../../../components/UserFollowList";

type FollowUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type FollowersPageProps = {
  params: Promise<{
    username: string;
  }>;
};

async function getFollowers(
  username: string,
): Promise<FollowUser[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000";

  const response = await fetch(
    `${API_URL}/users/${username}/followers`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function FollowersPage({
  params,
}: FollowersPageProps) {
  const { username } =
    await params;

  const followers =
    await getFollowers(username);

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
              Seguidores
            </h1>

            <p>
              Pessoas que seguem
              @{username}.
            </p>
          </div>

          <strong>
            {followers.length}
          </strong>
        </div>

        <UserFollowList
          users={followers}
          emptyMessage="Este usuário ainda não possui seguidores."
        />
      </section>
    </main>
  );
}