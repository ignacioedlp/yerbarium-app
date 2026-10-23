import { BrandFeed } from "@/components/brand-feed";
import { tr, useLocale } from "@/i18n";
import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Page, QueryState, YerbaCard, useUIStyles } from "@/components/ui";
import { Paper, SearchBox, SectionHeading } from "@/components/editorial";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme";
import { usePages, useResource } from "@/hooks/queries";
import { YerbaMateListItem, PaginatedResponse, YerbaStyle } from "@/api/types";
import { learningLinks } from "@/content/learning";
import { CommunityPodium } from "@/components/community-podium";

export function Home() {
  const t = useTheme();
  const styles = useUIStyles();
  useLocale();
  const { width: windowWidth } = useWindowDimensions();
  const carouselRef = React.useRef<ScrollView>(null);
  const carouselIndex = React.useRef(0);
  const [activeCarouselIndex, setActiveCarouselIndex] = React.useState(0);
  const [carouselWidth, setCarouselWidth] = React.useState(0);
  const [carouselPaused, setCarouselPaused] = React.useState(false);
  const yerbas = usePages<YerbaMateListItem>("yerbas/");
  const taxonomy = useResource<PaginatedResponse<YerbaStyle>>("styles/");
  const featured = yerbas.data?.pages[0]?.results.slice(0, 4) ?? [];
  const cardWidth = Math.min(windowWidth - t.spacing.lg * 2, 360);
  const carouselStep = cardWidth + 12;

  React.useEffect(() => {
    if (featured.length < 2 || !carouselWidth || carouselPaused) return;
    const timer = setInterval(() => {
      const next = (carouselIndex.current + 1) % featured.length;
      carouselIndex.current = next;
      setActiveCarouselIndex(next);
      carouselRef.current?.scrollTo({ x: next * carouselStep, animated: true });
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselPaused, carouselStep, carouselWidth, featured.length]);

  const moveCarousel = (direction: -1 | 1) => {
    if (featured.length < 2) return;
    const next =
      (carouselIndex.current + direction + featured.length) % featured.length;
    carouselIndex.current = next;
    carouselRef.current?.scrollTo({ x: next * carouselStep, animated: true });
  };
  return (
    <Page safeTop tabBarClearance>
      <View style={{ position: "relative", marginTop: t.spacing.md }}>
        <View
          style={{
            minHeight: 128,
            padding: t.spacing.md,
            paddingRight: 164,
            justifyContent: "center",
            backgroundColor: t.colors.hero,
            borderRadius: t.radius.card,
            borderCurve: "continuous",
            overflow: "hidden",
            isolation: "isolate",
          }}
        >
          <Paper dark />
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                fontSize: 30,
                lineHeight: 32,
                textTransform: "uppercase",
                color: t.colors.onDark,
              },
            ]}
          >
            {tr("Tu")}
            {"\n"}
            {tr("próxima")}
            {"\n"}
            <Text style={{ color: t.colors.lime }}>{tr("yerba.")}</Text>
          </Text>
        </View>
        <Image
          source={require("../../assets/images/mate-hero-inicio.webp")}
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            right: -8,
            bottom: 0,
          }}
          contentFit="contain"
          contentPosition="right"
          accessible={false}
        />
      </View>
      <SearchBox
        onSubmit={() =>
          router.push({ pathname: "/explorar", params: { mode: "search" } })
        }
        placeholder={tr("Buscar yerbas o marcas…")}
      />
      <View style={{ gap: 12 }}>
        <SectionHeading title={tr("Explorá por estilo")} />
        <QueryState
          query={taxonomy}
          skeleton="chips"
          empty={taxonomy.data?.count === 0}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {taxonomy.data?.results.map((style) => (
              <Pressable
                key={style.slug}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/explorar",
                    params: { style: style.slug },
                  })
                }
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  minHeight: 44,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.colors.sage,
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={[styles.body, { fontSize: 14 }]}>
                  {tr(style.name)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </QueryState>
      </View>
      <CommunityPodium />
      <BrandFeed />
      <View style={{ gap: 16 }}>
        <SectionHeading
          title={tr("Yerbas destacadas")}
          action={tr("Ver todas")}
          onPress={() => router.push("/explorar")}
        />
        <QueryState
          query={yerbas}
          yerbaCards
          empty={yerbas.data?.pages[0]?.count === 0}
        >
          <View
            onLayout={(event) =>
              setCarouselWidth(event.nativeEvent.layout.width)
            }
            onTouchStart={() => setCarouselPaused(true)}
            onTouchEnd={() => setCarouselPaused(false)}
          >
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              snapToInterval={carouselStep}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              onMomentumScrollEnd={(event) => {
                carouselIndex.current =
                  Math.round(event.nativeEvent.contentOffset.x / carouselStep) %
                  Math.max(featured.length, 1);
                setActiveCarouselIndex(carouselIndex.current);
              }}
              accessibilityLabel={tr("Yerbas destacadas, carrusel")}
            >
              {featured.map((yerba, index) => (
                <View key={yerba.slug} style={{ width: cardWidth }}>
                  <YerbaCard yerba={yerba} index={index} />
                </View>
              ))}
            </ScrollView>
            {featured.length > 1 && (
              <View
                accessibilityLabel={tr("Paginación de yerbas destacadas")}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  paddingTop: 12,
                }}
              >
                {featured.map((yerba, index) => (
                  <Pressable
                    key={yerba.slug}
                    accessibilityRole="button"
                    accessibilityLabel={tr("Ver yerba {0} de {1}: {2}", {
                      0: index + 1,
                      1: featured.length,
                      2: yerba.name,
                    })}
                    accessibilityState={{
                      selected: activeCarouselIndex === index,
                    }}
                    onPress={() => {
                      carouselIndex.current = index;
                      setActiveCarouselIndex(index);
                      carouselRef.current?.scrollTo({
                        x: index * carouselStep,
                        animated: true,
                      });
                    }}
                    hitSlop={8}
                    style={{
                      width: activeCarouselIndex === index ? 20 : 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor:
                        activeCarouselIndex === index
                          ? t.colors.green
                          : t.colors.muted + "33",
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </QueryState>
      </View>
      <View style={{ gap: t.spacing.sm }}>
        <SectionHeading title={tr("Aprende")} />
        <Text style={styles.body}>
          {tr("Un catálogo y una comunidad para conocer mejor la yerba mate.")}
        </Text>
        <View style={{ borderTopWidth: 1, borderColor: t.colors.subtleBorder }}>
          {learningLinks.map(({ article, label }) => (
            <Pressable
              key={article}
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: "/editorial/[article]",
                  params: { article },
                })
              }
              style={({ pressed }) => ({
                minHeight: 52,
                flexDirection: "row",
                alignItems: "center",
                gap: t.spacing.sm,
                borderBottomWidth: 1,
                borderColor: t.colors.subtleBorder,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: t.fonts.bold,
                  fontSize: 16,
                  color: t.colors.green,
                }}
              >
                {tr(label)}
              </Text>
              <Icon name="arrow" size={18} />
            </Pressable>
          ))}
        </View>
      </View>
    </Page>
  );
}
