import { AnimatedTabs } from "@/components/animated-tabs";
import { useFollowedBrands } from "@/hooks/brand-follows";
import type { BrandListItem } from "@/api/types";
import type { FollowMember } from "@/api/follows";
import { useSession } from "@/providers/session";
import React from "react";
import { ActivityIndicator, FlatList, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { tr, useLocale } from "@/i18n";
import { Body, Button, Card, Title, Page } from "@/components/ui";
import { Paper } from "@/components/editorial";
import { useFollowList, type FollowDirection } from "@/hooks/follows";
import { theme } from "@/theme";

export function FollowList({ direction }: { direction: FollowDirection }) {
  useLocale();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [tab, setTab] = React.useState<"people" | "brands">("people");
  const people = useFollowList(username, direction);
  const brands = useFollowedBrands(
    direction === "following" && tab === "brands",
  );
  const showingBrands = direction === "following" && tab === "brands";
  const query = showingBrands ? brands : people;
  const { user, ready } = useSession();
  const title = tr(direction === "followers" ? "Seguidores" : "Seguidos");
  const rows: (FollowMember | BrandListItem)[] = showingBrands
    ? (brands.data?.pages.flatMap((page) => page.results) ?? [])
    : (people.data?.pages.flatMap((page) => page.results) ?? []);
  const members = [
    ...new Map(
      rows.map((item) => [
        "username" in item ? item.username : item.slug,
        item,
      ]),
    ).values(),
  ];
  if (!ready || user?.username !== username)
    return (
      <Page>
        <Stack.Screen options={{ title, headerShown: true }} />
        {!ready ? (
          <ActivityIndicator color={theme.colors.green} />
        ) : (
          <Body>{tr("Solo podés ver tus seguidores y seguidos.")}</Body>
        )}
      </Page>
    );
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <Paper />
      <Stack.Screen options={{ title, headerShown: true }} />
      <FlatList<FollowMember | BrandListItem>
        data={query.isError ? [] : members}
        keyExtractor={(item) =>
          "username" in item ? item.username : item.slug
        }
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          flexGrow: 1,
        }}
        refreshing={query.isRefetching}
        onRefresh={() => {
          void query.refetch();
        }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.sm }}>
            <Title>{title}</Title>
            <Body>@{username}</Body>
            {direction === "following" && (
              <AnimatedTabs
                options={[
                  { key: "people", label: "Personas" },
                  { key: "brands", label: "Marcas" },
                ]}
                selected={tab}
                onSelect={setTab}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          query.isPending ? (
            query.fetchStatus === "paused" ? (
              <Body>
                {tr("Conectate para cargar esta información por primera vez.")}
              </Body>
            ) : (
              <ActivityIndicator color={theme.colors.green} />
            )
          ) : query.isError ? (
            <Card>
              <Body>
                {tr(
                  "No se pudo cargar la lista. El perfil puede ser privado o no estar disponible.",
                )}
              </Body>
              <Button
                label={tr("Reintentar")}
                onPress={() => {
                  void query.refetch();
                }}
              />
            </Card>
          ) : (
            <Body>
              {tr(
                showingBrands
                  ? "Todavía no seguís marcas."
                  : "Todavía no hay usuarios en esta lista.",
              )}
            </Body>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={
              "username" in item
                ? `${item.display_name}, @${item.username}`
                : item.name
            }
            style={({ pressed }) => ({
              minHeight: 52,
              paddingVertical: theme.spacing.md,
              gap: theme.spacing.sm,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.6 : 1,
            })}
            onPress={() =>
              "username" in item
                ? router.push({
                    pathname: "/usuarios/[username]",
                    params: { username: item.username },
                  })
                : router.push({
                    pathname: "/marcas/[slug]",
                    params: { slug: item.slug },
                  })
            }
          >
            <Body>{"username" in item ? item.display_name : item.name}</Body>
            {"username" in item && <Body muted>@{item.username}</Body>}
          </Pressable>
        )}
        ListFooterComponent={
          query.hasNextPage && !query.isError ? (
            <Button
              label={tr("Cargar más")}
              disabled={query.isFetchingNextPage}
              onPress={() => {
                void query.fetchNextPage();
              }}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
