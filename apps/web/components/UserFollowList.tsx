type FollowUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type UserFollowListProps = {
  users: FollowUser[];
  emptyMessage: string;
};

export default function UserFollowList({
  users,
  emptyMessage,
}: UserFollowListProps) {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="follow-list">
      {users.map((user) => (
        <a
          key={user.id}
          href={`/users/${user.username}`}
          className="follow-list-card"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`Avatar de ${user.username}`}
              className="follow-list-avatar"
            />
          ) : (
            <div className="follow-list-avatar-placeholder">
              {(
                user.displayName ||
                user.username
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div className="follow-list-info">
            <strong>
              {user.displayName ||
                user.username}
            </strong>

            <span>
              @{user.username}
            </span>

            {user.bio && (
              <p>{user.bio}</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}