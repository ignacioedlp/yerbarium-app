import { tr, useLocale } from "@/i18n";
import React, { useState } from "react";
import { LibraryYerbaCard } from "@/components/library-yerba-card";
import { YerbaCardSkeletons } from "@/components/yerba-card-loading";
import { View } from "react-native";
import { useTheme } from "@/theme";
import { Title, Button, EmptyState, QueryState } from "@/components/ui";
import {
  AnimatedTabContent,
  AnimatedTabs,
  type AnimatedTabOption,
} from "@/components/animated-tabs";
import { useSession } from "@/providers/session";
import { router } from "expo-router";
import { usePages, useResource } from "@/hooks/queries";
import {
  LibraryCollection,
  LibraryEntry,
  LibrarySummary,
} from "@/api/community-types";

const COLLECTION_TABS: AnimatedTabOption<LibraryCollection>[] = [
  { key: "favorite", label: "Favoritas" },
  { key: "tried", label: "Probadas" },
  { key: "want_to_try", label: "Quiero probar" },
];

export function ProfileLibrary() {
  const theme = useTheme();
  useLocale();
  const { user } = useSession();
  const [state, setState] = useState<LibraryCollection>("favorite");
  const query = usePages<LibraryEntry>(
    "auth/library/",
    { state },
    true,
    !!user,
  );
  const summary = useResource<LibrarySummary>(
    "auth/library/summary/",
    true,
    !!user,
  );
  const collectionCounts: Record<LibraryCollection, number> = {
    favorite: summary.data?.favorites ?? 0,
    tried: summary.data?.tried ?? 0,
    want_to_try: summary.data?.want_to_try ?? 0,
  };
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <Title>{tr("Mi biblioteca")}</Title>
      <AnimatedTabs
        options={COLLECTION_TABS.map((option) => ({
          ...option,
          count: summary.data ? collectionCounts[option.key] : undefined,
        }))}
        selected={state}
        onSelect={setState}
      />
      <AnimatedTabContent activeKey={state}>
        <QueryState query={query} yerbaCards>
          {query.data?.pages[0]?.count === 0 ? (
            <EmptyState
              title={tr("Tu biblioteca está esperando")}
              description={tr(
                "Guardá tus yerbas favoritas y encontralas acá cuando quieras.",
              )}
              action={
                <Button
                  label={tr("Explorar yerbas")}
                  onPress={() => router.push("/(tabs)/explorar")}
                />
              }
            />
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              {query.data?.pages
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
        {query.isFetchingNextPage && <YerbaCardSkeletons />}
        {query.hasNextPage && (
          <Button
            label={tr("Cargar más")}
            disabled={query.isFetchingNextPage}
            onPress={() => {
              void query.fetchNextPage();
            }}
          />
        )}
      </AnimatedTabContent>
    </View>
  );
}
