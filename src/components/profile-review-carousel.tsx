import { ReviewLike } from "./review-like";
import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useIsFocused } from "expo-router";
import { useSocialResource } from "@/hooks/follows";
import { Review } from "@/api/community-types";
import { Body, Button } from "./ui";
import { LeafRating } from "./leaf-rating";
import { theme } from "@/theme";
import { getLocale, tr, useLocale } from "@/i18n";

type ProfileReview = Review & { yerba_name: string; brand_name: string };
export function ProfileReviewCarousel({ username }: { username: string }) {
  useLocale();
  const query = useSocialResource<ProfileReview[]>(
    `profiles/${encodeURIComponent(username)}/reviews/recent/`,
  );
  if (query.isPending) return <Body muted>{tr("Cargando reseñas…")}</Body>;
  if (query.isError)
    return (
      <View style={{ gap: theme.spacing.sm }}>
        <Body muted>{tr("No pudimos cargar las últimas reseñas.")}</Body>
        <Button
          compact
          secondary
          label={tr("Reintentar")}
          onPress={() => void query.refetch()}
        />
      </View>
    );
  if (!query.data?.length) return null;
  return (
    <ReviewCarousel
      key={`${username}-${query.data.map((review) => review.id).join("-")}`}
      reviews={query.data}
    />
  );
}

function ReviewCarousel({ reviews }: { reviews: ProfileReview[] }) {
  const focused = useIsFocused();
  const scroll = useRef<ScrollView>(null);
  const index = useRef(0);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [appActive, setAppActive] = useState(
    AppState.currentState === "active",
  );
  // Start with motion disabled until accessibility settings have been read.
  const [reduceMotion, setReduceMotion] = useState(true);
  const [screenReader, setScreenReader] = useState(true);
  const step = Math.max(0, width - 20);
  const cardWidth = Math.max(0, step - theme.spacing.sm);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(value);
      })
      .catch(() => undefined);
    void AccessibilityInfo.isScreenReaderEnabled()
      .then((value) => {
        if (active) setScreenReader(value);
      })
      .catch(() => undefined);
    const motion = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    const reader = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setScreenReader,
    );
    const app = AppState.addEventListener("change", (state) =>
      setAppActive(state === "active"),
    );
    return () => {
      active = false;
      motion.remove();
      reader.remove();
      app.remove();
    };
  }, []);
  useEffect(() => {
    if (
      !focused ||
      !appActive ||
      reduceMotion ||
      screenReader ||
      paused ||
      !step ||
      reviews.length < 2
    )
      return;
    const timer = setInterval(() => {
      const next = (index.current + 1) % reviews.length;
      index.current = next;
      setSelected(next);
      scroll.current?.scrollTo({ x: next * step, animated: next !== 0 });
    }, 5000);
    return () => clearInterval(timer);
  }, [
    focused,
    appActive,
    reduceMotion,
    screenReader,
    paused,
    step,
    reviews.length,
  ]);
  // Keep the selected review aligned after a width/orientation change.
  useEffect(() => {
    scroll.current?.scrollTo({ x: index.current * step, animated: false });
  }, [step]);
  return (
    <View
      style={{ gap: theme.spacing.sm }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing.sm,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{
            flex: 1,
            fontFamily: theme.fonts.bold,
            fontSize: 18,
            color: theme.colors.green,
          }}
        >
          {tr("Últimas reseñas")}
        </Text>
      </View>
      {width > 0 && (
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={step}
          decelerationRate="fast"
          disableIntervalMomentum
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
          onScrollEndDrag={() => setPaused(false)}
          onScrollBeginDrag={() => setPaused(true)}
          onMomentumScrollEnd={(event) => {
            const next = Math.max(
              0,
              Math.min(
                reviews.length - 1,
                Math.round(event.nativeEvent.contentOffset.x / step),
              ),
            );
            index.current = next;
            setSelected(next);
            setPaused(false);
          }}
          contentContainerStyle={{
            gap: theme.spacing.sm,
            paddingRight: width - cardWidth,
          }}
          accessibilityLabel={tr("Últimas reseñas")}
        >
          {reviews.map((review, position) => (
            <View
              key={review.id}
              style={{
                width: cardWidth,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.subtleBorder,
                borderRadius: theme.radius.card,
                padding: theme.spacing.md,
                gap: theme.spacing.sm,
              }}
            >
              <Pressable
                testID={`profile-review-${review.id}`}
                accessibilityRole="link"
                accessibilityLabel={tr(
                  "Ver reseña de {yerba}, {position} de {count}",
                  {
                    yerba: review.yerba_name,
                    position: position + 1,
                    count: reviews.length,
                  },
                )}
                accessibilityHint={`${Number(review.rating).toLocaleString(getLocale())} / 5. ${review.comment}`}
                onPress={() =>
                  router.push({
                    pathname: "/resenas/[id]",
                    params: { id: String(review.id) },
                  })
                }
                style={{
                  flex: 1,
                  gap: theme.spacing.sm,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: theme.fonts.body,
                    fontSize: theme.type.caption,
                    color: theme.colors.muted,
                  }}
                >
                  {review.brand_name}
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    fontFamily: theme.fonts.bold,
                    fontSize: 19,
                    color: theme.colors.green,
                  }}
                >
                  {review.yerba_name}
                </Text>
                <LeafRating value={review.rating} size={17} />
                {review.comment ? (
                  <Text
                    numberOfLines={3}
                    style={{
                      fontFamily: theme.fonts.body,
                      fontSize: 15,
                      lineHeight: 21,
                      color: theme.colors.ink,
                    }}
                  >
                    {review.comment}
                  </Text>
                ) : null}
              </Pressable>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: theme.spacing.sm,
                }}
              >
                <Text
                  style={{
                    flexShrink: 1,
                    fontFamily: theme.fonts.body,
                    fontSize: theme.type.caption,
                    color: theme.colors.muted,
                  }}
                >
                  {new Date(review.created_at).toLocaleDateString(getLocale(), {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
                <ReviewLike
                  key={`${review.id}-${review.likes_count}-${review.liked_by_me}`}
                  review={review}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {reviews.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.xs,
            justifyContent: "center",
          }}
          accessibilityLabel={tr("Reseña {position} de {count}", {
            position: selected + 1,
            count: reviews.length,
          })}
        >
          {reviews.map((review, position) => (
            <View
              key={review.id}
              style={{
                width: position === selected ? 18 : 6,
                height: 6,
                borderRadius: theme.radius.pill,
                backgroundColor:
                  position === selected
                    ? theme.colors.green
                    : theme.colors.border,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
