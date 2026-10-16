import { tr, useLocale } from "@/i18n";
import React, { useState } from "react";
import { LibraryYerbaCard } from "@/components/library-yerba-card";
import { YerbaCardSkeletons } from "@/components/yerba-card-loading";
import { View } from "react-native";
import { theme } from "@/theme";
import {
  Page,
  Title,
  Body,
  Button,
  Card,
  QueryState,
  RequireSession,
} from "@/components/ui";
import {
  AnimatedTabContent,
  AnimatedTabs,
  type AnimatedTabOption,
} from "@/components/animated-tabs";
import { useSession } from "@/providers/session";
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

export function Library() {
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
    <Page safeTop>
      <Title>{tr("Mi biblioteca")}</Title>
      <RequireSession>
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
              <Card>
                <Title>{tr("Tu biblioteca está esperando")}</Title>
                <Body>
                  {tr("Guardá yerbas desde sus fichas para encontrarlas acá.")}
                </Body>
              </Card>
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
      </RequireSession>
    </Page>
  );
}
