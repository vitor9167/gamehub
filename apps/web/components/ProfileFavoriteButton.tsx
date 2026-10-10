"use client";

import { useAuth } from "../contexts/AuthContext";
import FavoriteLibraryButton from "./FavoriteLibraryButton";

type ProfileFavoriteButtonProps = {
  profileUsername: string;
  gameId: string;
  initialFavorite: boolean;
};

export default function ProfileFavoriteButton({
  profileUsername,
  gameId,
  initialFavorite,
}: ProfileFavoriteButtonProps) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading || !user) {
    return null;
  }

  if (
    user.username !==
    profileUsername
  ) {
    return null;
  }

  return (
    <FavoriteLibraryButton
      gameId={gameId}
      initialFavorite={
        initialFavorite
      }
    />
  );
}