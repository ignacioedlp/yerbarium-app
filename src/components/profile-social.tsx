import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { tr, useLocale } from "@/i18n";
import { Button, Body } from "@/components/ui";
import { theme } from "@/theme";
import { useSession } from "@/providers/session";
import { useFollow, useSocialResource } from "@/hooks/follows";
import type { Account, PublicProfile } from "@/api/account-types";

export function ProfileSocial({ profile }: { profile: PublicProfile }) {
  useLocale();
  const { user } = useSession();
  const mutation = useFollow(profile.username);
  if (profile.is_private || profile.is_blocked) return null;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <SocialCounts
        username={profile.username}
        followers={profile.followers_count}
        following={profile.following_count}
      />
      {user &&
      user.username !== profile.username &&
      profile.can_follow !== false ? (
        <Button
          label={tr(profile.is_following ? "Siguiendo" : "Seguir")}
          accessibilityLabel={tr(
            profile.is_following
              ? "Dejar de seguir a @{username}"
              : "Seguir a @{username}",
            { username: profile.username },
          )}
          disabled={mutation.isPending}
          onPress={() => {
            if (!mutation.isPending) mutation.mutate(!profile.is_following);
          }}
        />
      ) : null}
      {mutation.error ? <Body>{mutation.error.message}</Body> : null}
    </View>
  );
}

function SocialCounts({
  username,
  followers,
  following,
}: {
  username: string;
  followers?: number;
  following?: number;
}) {
  const { user } = useSession();
  if (user?.username !== username)
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: theme.spacing.lg,
        }}
      >
        <Body>
          {followers ?? 0} {tr("seguidores")}
        </Body>
        <Body>
          {following ?? 0} {tr("seguidos")}
        </Body>
      </View>
    );
  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.lg }}
    >
      <Pressable
        accessibilityRole="link"
        style={{ minHeight: 44, justifyContent: "center" }}
        onPress={() =>
          router.push({
            pathname: "/usuarios/[username]/seguidores",
            params: { username },
          })
        }
      >
        <Body>
          {followers ?? 0} {tr("seguidores")}
        </Body>
      </Pressable>
      <Pressable
        accessibilityRole="link"
        style={{ minHeight: 44, justifyContent: "center" }}
        onPress={() =>
          router.push({
            pathname: "/usuarios/[username]/seguidos",
            params: { username },
          })
        }
      >
        <Body>
          {following ?? 0} {tr("seguidos")}
        </Body>
      </Pressable>
    </View>
  );
}

export function OwnProfileSocial() {
  const { user } = useSession();
  const query = useSocialResource<Account>("auth/me/", !!user);
  if (!user) return null;
  const account = query.data ?? user;
  return (
    <SocialCounts
      username={user.username}
      followers={account.followers_count}
      following={account.following_count}
    />
  );
}
