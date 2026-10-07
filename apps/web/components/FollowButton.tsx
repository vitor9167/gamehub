"use client";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../contexts/AuthContext";
import { apiJson } from "../lib/api";

type FollowStatusResponse = {
  following: boolean;
  isOwnProfile: boolean;
};

type FollowButtonProps = {
  username: string;
  initialFollowers: number;
};

export default function FollowButton({
  username,
  initialFollowers,
}: FollowButtonProps) {
  const {
    token,
    user,
  } = useAuth();

  const [
    following,
    setFollowing,
  ] = useState(false);

  const [
    followers,
    setFollowers,
  ] = useState(initialFollowers);

  const [
    isOwnProfile,
    setIsOwnProfile,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    async function loadStatus() {
      try {
        const data =
          await apiJson<FollowStatusResponse>(
            `/users/${username}/follow-status`,
            {
              token,
            },
          );

        setFollowing(
          data.following,
        );

        setIsOwnProfile(
          data.isOwnProfile,
        );
      } catch {
        setFollowing(false);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, [
    token,
    user,
    username,
  ]);

  async function handleFollow() {
    if (!token) {
      window.location.href =
        "/login";

      return;
    }

    setSaving(true);

    try {
      if (following) {
        await apiJson(
          `/users/${username}/follow`,
          {
            method: "DELETE",
            token,
          },
        );

        setFollowing(false);

        setFollowers(
          (current) =>
            Math.max(
              current - 1,
              0,
            ),
        );
      } else {
        await apiJson(
          `/users/${username}/follow`,
          {
            method: "POST",
            token,
          },
        );

        setFollowing(true);

        setFollowers(
          (current) =>
            current + 1,
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return null;
  }

  if (isOwnProfile) {
    return null;
  }

  return (
    <div className="follow-action">
      <button
        type="button"
        className={
          following
            ? "follow-button following"
            : "follow-button"
        }
        onClick={
          handleFollow
        }
        disabled={saving}
      >
        {saving
          ? "Aguarde..."
          : following
            ? "Seguindo"
            : "Seguir"}
      </button>

      <span className="follow-action-count">
        {followers}{" "}
        {followers === 1
          ? "seguidor"
          : "seguidores"}
      </span>
    </div>
  );
}