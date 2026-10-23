import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { tr, useLocale } from "@/i18n";
import {
  Body,
  Button,
  Card,
  QueryState,
  Title,
  YerbaCard,
} from "@/components/ui";
import { SectionHeading } from "@/components/editorial";
import { useBrandPages } from "@/hooks/brand-follows";
import { useSession } from "@/providers/session";
import type { BrandFeedEvent } from "@/api/brand-feed";
import { useTheme } from "@/theme";

export function BrandFeed() {
  const theme = useTheme();
  useLocale();
  const { user } = useSession();
  const feed = useBrandPages<BrandFeedEvent>("auth/feed/");
  const events = [
    ...new Map(
      feed.data?.pages
        .flatMap((page) => page.results)
        .map((event) => [event.id, event]),
    ).values(),
  ];
  if (!user || (!feed.isPending && !feed.isError && events.length === 0))
    return null;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <SectionHeading title={tr("Novedades de tus marcas")} />
      <QueryState query={feed}>
        {feed.data?.pages[0]?.count === 0 ? (
          <Body>
            {tr("Seguí marcas para descubrir sus productos y novedades.")}
          </Body>
        ) : (
          events.map((event) => (
            <View key={event.id} style={{ gap: theme.spacing.sm }}>
              {event.kind === "news" && (
                <>
                  <Pressable
                    accessibilityRole="link"
                    style={{ minHeight: 44, justifyContent: "center" }}
                    onPress={() =>
                      router.push({
                        pathname: "/marcas/[slug]",
                        params: { slug: event.brand.slug },
                      })
                    }
                  >
                    <Body>{event.brand.name}</Body>
                  </Pressable>
                  <Body muted>{tr("Novedad de marca")}</Body>
                </>
              )}
              {event.kind === "news" ? (
                <Card>
                  <Title>{event.title}</Title>
                  <Body>{event.body}</Body>
                </Card>
              ) : null}
              {event.product ? (
                <YerbaCard
                  yerba={event.product}
                  badge={
                    event.kind === "product"
                      ? {
                          text: tr("Nueva incorporación"),
                          accessibilityLabel: tr("Nueva incorporación"),
                        }
                      : undefined
                  }
                />
              ) : null}
            </View>
          ))
        )}
      </QueryState>
      {feed.hasNextPage && (
        <Button
          label={tr("Cargar más")}
          disabled={feed.isFetchingNextPage}
          onPress={() => {
            void feed.fetchNextPage();
          }}
        />
      )}
    </View>
  );
}
