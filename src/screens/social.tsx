import { ReviewLike } from "@/components/review-like";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AnimatedTabs } from "@/components/animated-tabs";
import {
  Body,
  Button,
  EmptyState,
  Page,
  RequireSession,
  TAB_BAR_CONTENT_CLEARANCE,
  Title,
  YerbaCard,
} from "@/components/ui";
import { LeafRating } from "@/components/leaf-rating";
import { useSocialFeed } from "@/hooks/social-feed";
import { useSession } from "@/providers/session";
import type { SocialFeedEvent, SocialTab } from "@/api/social-feed";
import { tr, useLocale, getLocale } from "@/i18n";
import { useTheme, useThemedStyles, type AppTheme } from "@/theme";
import { Image } from "expo-image";
import { Icon } from "@/components/icon";

function ProductReference({
  product,
  featured = false,
}: {
  product: NonNullable<SocialFeedEvent["product"]>;
  featured?: boolean;
}) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const image = product.images?.[0];
  const [failedUrl, setFailedUrl] = React.useState<string>();
  const hasImage = image && image.url !== failedUrl;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={tr("Ver {0} {1}", {
        0: product.brand.name,
        1: product.name,
      })}
      onPress={() =>
        router.push({
          pathname: "/yerbas/[slug]",
          params: { slug: product.slug },
        })
      }
      style={({ pressed }) => [
        styles.product,
        featured ? styles.featuredProduct : styles.reviewReference,
        { opacity: pressed ? 0.65 : 1 },
      ]}
    >
      {hasImage ? (
        <View style={[styles.thumbnail, featured && styles.featuredThumbnail]}>
          <Image
            source={{ uri: image.url }}
            contentFit="contain"
            style={styles.productImage}
            onError={() => setFailedUrl(image.url)}
            accessible={false}
          />
        </View>
      ) : null}
      <View
        style={
          featured ? styles.featuredCopy : { flex: 1, gap: theme.spacing.xs }
        }
      >
        <Text
          style={[
            styles.productName,
            featured ? styles.featuredName : styles.reviewProductName,
          ]}
        >
          {product.name}
        </Text>
        {!featured ? (
          <Text style={styles.caption}>
            {product.brand.name}
            {!hasImage ? ` · ${tr("Sin foto")}` : ""}
          </Text>
        ) : (
          <View style={styles.brandFooter}>
            <Text style={styles.productAction}>{tr("Ver yerba")}</Text>
            <Icon name="arrow" size={18} />
          </View>
        )}
      </View>
      {!featured ? <Icon name="arrow" size={18} /> : null}
    </Pressable>
  );
}

function EventDate({ date }: { date: string }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Text
      style={styles.date}
      accessibilityLabel={new Date(date).toLocaleDateString(getLocale())}
    >
      {new Date(date).toLocaleDateString(getLocale(), {
        day: "numeric",
        month: "short",
      })}
    </Text>
  );
}

function NewProductEvent({
  event,
}: {
  event: Extract<SocialFeedEvent, { kind: "product" }>;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.event}>
      <YerbaCard
        yerba={event.product}
        badge={{
          text: tr("Nueva incorporación"),
          accessibilityLabel: tr("Nueva incorporación"),
        }}
      />
      <View style={styles.byline}>
        <Pressable
          accessibilityRole="link"
          style={styles.catalogBrandLink}
          accessibilityLabel={tr("Ver marca {0}", { 0: event.brand.name })}
          onPress={() =>
            router.push({
              pathname: "/marcas/[slug]",
              params: { slug: event.brand.slug },
            })
          }
        >
          <Text style={styles.caption}>{tr("· Ver marca")}</Text>
        </Pressable>
        <EventDate date={event.published_at} />
      </View>
    </View>
  );
}

function BrandEvent({
  event,
}: {
  event: Exclude<SocialFeedEvent, { kind: "review" }>;
}) {
  const styles = useThemedStyles(createStyles);
  const [failedLogo, setFailedLogo] = React.useState<string>();
  return (
    <View style={styles.event}>
      <View style={styles.brandPanel}>
        <View style={styles.byline}>
          <Pressable
            accessibilityRole="link"
            style={styles.brandLink}
            onPress={() =>
              router.push({
                pathname: "/marcas/[slug]",
                params: { slug: event.brand.slug },
              })
            }
          >
            <View style={styles.brandSymbol}>
              {event.brand.image_url && event.brand.image_url !== failedLogo ? (
                <Image
                  source={{ uri: event.brand.image_url }}
                  contentFit="contain"
                  style={styles.productImage}
                  onError={() =>
                    setFailedLogo(event.brand.image_url ?? undefined)
                  }
                  accessible={false}
                />
              ) : (
                <Text style={styles.brandMonogram}>
                  {event.brand.name
                    .replace(/\([^)]*\)/g, "")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")
                    .toLocaleUpperCase(getLocale())}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.author}>{event.brand.name}</Text>
              <Text style={styles.caption}>{tr("Marca")}</Text>
            </View>
          </Pressable>
          <EventDate date={event.published_at} />
        </View>
        <View style={styles.brandActivity}>
          <Text style={[styles.caption, { flex: 1 }]}>
            {tr(
              event.kind === "product"
                ? "Producto incorporado al catálogo"
                : "Novedad de marca",
            )}
          </Text>
        </View>
        {event.kind === "news" ? (
          <>
            <Text style={styles.newsTitle}>{event.title}</Text>
            <Text selectable style={styles.comment}>
              {event.body}
            </Text>
          </>
        ) : null}
        {event.product ? (
          <ProductReference
            key={event.product.slug}
            product={event.product}
            featured
          />
        ) : null}
      </View>
    </View>
  );
}

function EventCard({ event }: { event: SocialFeedEvent }) {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  if (event.kind === "product") return <NewProductEvent event={event} />;
  if (event.kind === "news") return <BrandEvent event={event} />;
  return (
    <View style={styles.event}>
      <View style={styles.byline}>
        <Pressable
          accessibilityRole="link"
          style={styles.authorLink}
          onPress={() =>
            router.push({
              pathname: "/usuarios/[username]",
              params: { username: event.author.username },
            })
          }
        >
          <Text style={styles.author}>
            {event.author.display_name || event.author.username}
          </Text>
        </Pressable>
        <EventDate date={event.published_at} />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing.sm,
        }}
      >
        <LeafRating value={event.review.rating} size={18} />
        <ReviewLike
          key={`${event.review.id}-${event.review.likes_count}-${event.review.liked_by_me}`}
          review={event.review}
        />
      </View>
      {event.review.comment ? (
        <Text selectable style={styles.comment}>
          {event.review.comment}
        </Text>
      ) : null}
      <ProductReference key={event.product.slug} product={event.product} />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    catalogBrandLink: { flex: 1, minHeight: 48, justifyContent: "center" },
    event: {
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.subtleBorder,
    },
    byline: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    authorLink: { minHeight: 20, justifyContent: "center", flex: 1 },
    author: {
      fontFamily: theme.fonts.bold,
      fontSize: 17,
      lineHeight: 23,
      color: theme.colors.ink,
    },
    date: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.muted,
      flexShrink: 1,
      textAlign: "right",
    },
    comment: {
      fontFamily: theme.fonts.body,
      fontSize: 17,
      lineHeight: 25,
      color: theme.colors.ink,
    },
    product: {
      marginTop: theme.spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.sage,
      borderRadius: theme.radius.control,
      minHeight: 72,
    },
    reviewReference: {
      backgroundColor: "transparent",
      borderRadius: 0,
      paddingHorizontal: 0,
      paddingVertical: theme.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.subtleBorder,
      minHeight: 80,
    },
    reviewProductName: {
      fontFamily: theme.fonts.display,
      fontSize: 23,
      lineHeight: 27,
    },
    thumbnail: {
      width: 68,
      height: 88,
      borderRadius: 8,
      backgroundColor: "transparent",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    productImage: { width: "100%", height: "100%" },
    featuredProduct: {
      marginTop: 0,
      padding: 0,
      backgroundColor: "transparent",
      flexDirection: "column",
      alignItems: "stretch",
      gap: theme.spacing.md,
      minHeight: 0,
    },
    featuredThumbnail: {
      width: "100%",
      height: 164,
      backgroundColor: theme.colors.background,
      borderWidth: 0,
      borderRadius: theme.radius.control,
    },
    featuredName: {
      fontFamily: theme.fonts.display,
      fontSize: 28,
      lineHeight: 32,
    },
    featuredCopy: { gap: theme.spacing.md },
    brandFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.subtleBorder,
      paddingTop: theme.spacing.sm,
    },
    brandMonogram: {
      fontFamily: theme.fonts.display,
      color: theme.colors.onDark,
      fontSize: 20,
    },
    productAction: {
      fontFamily: theme.fonts.bold,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.green,
    },
    brandPanel: {
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.subtleBorder,
      borderRadius: theme.radius.card,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    brandLink: {
      flex: 1,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    brandSymbol: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.colors.hero,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    brandActivity: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    productName: {
      fontFamily: theme.fonts.bold,
      fontSize: 16,
      lineHeight: 21,
      color: theme.colors.ink,
    },
    caption: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.muted,
    },
    newsTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 28,
      lineHeight: 32,
      color: theme.colors.ink,
    },
  });

function SocialContent() {
  const theme = useTheme();
  const [tab, setTab] = React.useState<SocialTab>("for_you");
  const feed = useSocialFeed(tab);
  const [refreshing, setRefreshing] = React.useState(false);
  const events = [
    ...new Map(
      feed.data?.pages.flatMap((p) => p.results).map((e) => [e.id, e]),
    ).values(),
  ];
  const retry = () => {
    void (feed.isFetchNextPageError ? feed.fetchNextPage() : feed.refetch());
  };
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          flexGrow: 1,
          paddingBottom: events.length ? TAB_BAR_CONTENT_CLEARANCE : 0,
          maxWidth: 680,
          width: "100%",
          alignSelf: "center",
        }}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          try {
            await feed.refetch();
          } finally {
            setRefreshing(false);
          }
        }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.sm }}>
            <Title>{tr("Social")}</Title>
            <AnimatedTabs
              options={[
                { key: "for_you", label: "Para vos" },
                { key: "following", label: "Siguiendo" },
              ]}
              selected={tab}
              onSelect={setTab}
            />
          </View>
        }
        ListEmptyComponent={
          feed.isPending ? (
            feed.fetchStatus === "paused" ? (
              <Body>{tr("Conectate para cargar la actividad.")}</Body>
            ) : (
              <ActivityIndicator color={theme.colors.green} />
            )
          ) : !feed.isError ? (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <EmptyState
                title={tr(
                  tab === "for_you"
                    ? "La ronda está tranquila"
                    : "Tu ronda está por empezar",
                )}
                description={tr(
                  tab === "for_you"
                    ? "Cuando la comunidad comparta opiniones y descubrimientos, los vas a encontrar acá."
                    : "Las novedades de las personas y marcas que seguís van a aparecer acá.",
                )}
                action={
                  <Button
                    label={tr("Explorar yerbas")}
                    onPress={() => router.push("/explorar")}
                  />
                }
              />
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={{ gap: theme.spacing.md }}>
            {feed.isError ? (
              <>
                <Body>{tr("No se pudo cargar la actividad.")}</Body>
                <Button
                  label={tr("Reintentar")}
                  disabled={feed.isFetching}
                  onPress={retry}
                />
              </>
            ) : feed.hasNextPage ? (
              <Button
                label={tr("Cargar más")}
                disabled={feed.isFetching}
                onPress={() => {
                  void feed.fetchNextPage();
                }}
              />
            ) : events.length ? (
              <Body muted>{tr("Ya viste toda la actividad.")}</Body>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}
export function SocialScreen() {
  const theme = useTheme();
  useLocale();
  const { user, ready } = useSession();
  if (!ready)
    return (
      <Page tabBarClearance>
        <ActivityIndicator color={theme.colors.green} />
      </Page>
    );
  if (!user)
    return (
      <Page tabBarClearance>
        <Title>{tr("Social")}</Title>
        <RequireSession bare />
      </Page>
    );
  return <SocialContent key={user.username} />;
}
