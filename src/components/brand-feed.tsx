import React from "react";
import { View, Pressable, ScrollView, useWindowDimensions } from "react-native";
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
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - theme.spacing.lg * 2, 360);
  const carouselRef = React.useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [itemHeights, setItemHeights] = React.useState<Record<string, number>>(
    {},
  );
  const carouselStep = cardWidth + 12;
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
      <SectionHeading title={tr("Novedades de tus marcas")} compact />
      <QueryState query={feed}>
        {feed.data?.pages[0]?.count === 0 ? (
          <Body>
            {tr("Seguí marcas para descubrir sus productos y novedades.")}
          </Body>
        ) : (
          <View>
            <ScrollView
              ref={carouselRef}
              style={{
                height: events[activeIndex]
                  ? itemHeights[events[activeIndex].id]
                  : undefined,
              }}
              onMomentumScrollEnd={(event) => {
                setActiveIndex(
                  Math.max(
                    0,
                    Math.min(
                      events.length - 1,
                      Math.round(
                        event.nativeEvent.contentOffset.x / carouselStep,
                      ),
                    ),
                  ),
                );
              }}
              horizontal
              snapToInterval={cardWidth + 12}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              accessibilityLabel={tr("Novedades de tus marcas")}
              contentContainerStyle={{ gap: 12, alignItems: "flex-start" }}
            >
              {events.map((event) => (
                <View
                  key={event.id}
                  onLayout={({ nativeEvent }) => {
                    const height = nativeEvent.layout.height;
                    setItemHeights((current) =>
                      current[event.id] === height
                        ? current
                        : { ...current, [event.id]: height },
                    );
                  }}
                  style={{ width: cardWidth, gap: theme.spacing.sm }}
                >
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
              ))}
            </ScrollView>
            {events.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 12,
                }}
              >
                {events.map((event, index) => (
                  <Pressable
                    key={event.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${tr("Novedades de tus marcas")}: ${index + 1} / ${events.length}, ${event.brand.name}`}
                    accessibilityState={{ selected: activeIndex === index }}
                    onPress={() => {
                      setActiveIndex(index);
                      carouselRef.current?.scrollTo({
                        x: index * carouselStep,
                        animated: true,
                      });
                    }}
                    hitSlop={8}
                    style={{
                      width: activeIndex === index ? 20 : 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor:
                        activeIndex === index
                          ? theme.colors.green
                          : theme.colors.muted + "33",
                    }}
                  />
                ))}
              </View>
            )}
          </View>
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
