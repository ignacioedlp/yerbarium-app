import { ProfileReviewCarousel } from "@/components/profile-review-carousel";
import { ProfileSocial } from "@/components/profile-social";
import { useSocialResource } from "@/hooks/follows";
import { tr, useLocale } from "@/i18n";
import { View } from "react-native";
import { LibraryYerbaCard } from "@/components/library-yerba-card";
import { YerbaCardSkeletons } from "@/components/yerba-card-loading";
import { EditorialHero, HandNote } from "@/components/editorial";
import {
  AnimatedTabContent,
  AnimatedTabs,
  type AnimatedTabOption,
} from "@/components/animated-tabs";
import { theme } from "@/theme";
import React, { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Page, Body, Button, Card, QueryState } from "@/components/ui";
import { useResource, usePages } from "@/hooks/queries";
import { PublicProfile as ProfileType } from "@/api/account-types";
import {
  LibraryCollection,
  LibraryEntry,
  LibrarySummary,
} from "@/api/community-types";
import { CommunitySafetyActions } from "@/components/community-safety-actions";
import { useSession } from "@/providers/session";

const COLLECTION_TABS: AnimatedTabOption<LibraryCollection>[] = [
  { key: "favorite", label: "Favoritas" },
  { key: "tried", label: "Probadas" },
  { key: "want_to_try", label: "Quiero probar" },
];

export function PublicProfile() {
  useLocale();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user } = useSession();
  const path = `profiles/${encodeURIComponent(username)}/`;
  const profile = useSocialResource<ProfileType>(path);
  const [blockedOverride, setBlockedOverride] = useState<boolean | null>(null);
  const [state, setState] = useState<LibraryCollection>("favorite");
  const isBlocked = blockedOverride ?? profile.data?.is_blocked ?? false;
  const visible = !!profile.data && !profile.data.is_private && !isBlocked;
  const library = usePages<LibraryEntry>(
    `${path}library/`,
    { state },
    false,
    visible,
  );
  const summary = useResource<LibrarySummary>(
    `${path}library/summary/`,
    false,
    visible,
  );
  const collectionCounts: Record<LibraryCollection, number> = {
    favorite: summary.data?.favorites ?? 0,
    tried: summary.data?.tried ?? 0,
    want_to_try: summary.data?.want_to_try ?? 0,
  };
  return (
    <Page>
      <Stack.Screen
        options={{
          headerRight:
            user && user.username !== username && profile.data
              ? () => (
                  <CommunitySafetyActions
                    username={username}
                    isBlocked={isBlocked}
                    onBlockChange={setBlockedOverride}
                  />
                )
              : undefined,
        }}
      />
      <QueryState query={profile} skeleton="header">
        <View
          style={{
            marginHorizontal: -theme.spacing.lg,
            marginTop: -theme.spacing.lg,
          }}
        >
          <EditorialHero
            title={profile.data?.display_name || username}
            accent={`@${username}`}
            compact
          />
        </View>
        {isBlocked ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Body>{tr("Bloqueaste a @{username}.", { username })}</Body>
          </View>
        ) : (
          <>
            {profile.data?.is_private ? (
              <Card>
                <Body>{tr("Este perfil es privado.")}</Body>
              </Card>
            ) : (
              <>
                {profile.data?.bio && (
                  <HandNote rotate={false}>{profile.data.bio}</HandNote>
                )}
                {profile.data && <ProfileSocial profile={profile.data} />}
                <ProfileReviewCarousel key={username} username={username} />
                <AnimatedTabs
                  options={COLLECTION_TABS.map((option) => ({
                    ...option,
                    count: summary.data
                      ? collectionCounts[option.key]
                      : undefined,
                  }))}
                  selected={state}
                  onSelect={setState}
                />
                <AnimatedTabContent activeKey={state}>
                  <QueryState query={library} yerbaCards>
                    {library.data?.pages[0]?.count === 0 ? (
                      <Body>
                        {tr("Esta colección todavía no tiene yerbas.")}
                      </Body>
                    ) : (
                      <View style={{ gap: theme.spacing.md }}>
                        {library.data?.pages
                          .flatMap((p) => p.results)
                          .map((item, index) => (
                            <LibraryYerbaCard
                              key={item.yerba.slug}
                              yerba={item.yerba}
                              index={index % 20}
                            />
                          ))}
                      </View>
                    )}
                  </QueryState>
                  {library.isFetchingNextPage && <YerbaCardSkeletons />}
                  {library.hasNextPage && (
                    <Button
                      label={tr("Cargar más")}
                      disabled={library.isFetchingNextPage}
                      onPress={() => {
                        void library.fetchNextPage();
                      }}
                    />
                  )}
                </AnimatedTabContent>
              </>
            )}
          </>
        )}
      </QueryState>
    </Page>
  );
}
