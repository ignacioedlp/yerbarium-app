import { tr, useLocale } from "@/i18n";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { theme as t } from "@/theme";

// Match the catalog card's footprint so the handoff keeps each row in place.
export function YerbaCardSkeleton() {
  useLocale();
  return (
    <View style={s.card} pointerEvents="none" accessible={false}>
      <View style={s.copy}>
        <View style={[s.block, { width: "48%", height: 12 }]} />
        <View style={[s.block, { width: "90%", height: 26 }]} />
        <View style={[s.block, { width: "72%", height: 14 }]} />
        <View
          style={[
            s.block,
            { width: "65%", height: 28, borderRadius: t.radius.pill },
          ]}
        />
        <View style={[s.block, { width: "85%", height: 12 }]} />
        <View style={[s.block, { width: "70%", height: 12 }]} />
      </View>
      <View style={s.pack} />
      <View style={s.favorite} />
    </View>
  );
}

export function YerbaCardSkeletons() {
  useLocale();
  return (
    <View
      testID="yerba-card-skeletons"
      accessible
      accessibilityLabel={tr("Cargando yerbas")}
      accessibilityState={{ busy: true }}
      style={{ gap: t.spacing.md }}
    >
      {[0, 1, 2].map((index) => (
        <YerbaCardSkeleton key={index} />
      ))}
    </View>
  );
}

export function YerbaCardReveal({
  children,
  index = 0,
  loading = false,
}: React.PropsWithChildren<{ index?: number; loading?: boolean }>) {
  useLocale();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion && !loading ? 1 : 0);
  // Bound the stagger to 110 ms; scrolling a long catalog must never add latency.
  const delay = Math.min(index, 2) * 55;
  React.useEffect(() => {
    cancelAnimation(progress);
    if (loading) {
      progress.set(0);
    } else {
      progress.set(
        withDelay(
          delay,
          withTiming(1, {
            duration: 220,
            easing: Easing.bezier(0.23, 1, 0.32, 1),
            reduceMotion: ReduceMotion.System,
          }),
          ReduceMotion.System,
        ),
      );
    }
    return () => cancelAnimation(progress);
  }, [delay, loading, progress]);
  const contentStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.get(),
  }));
  return (
    <View accessibilityState={{ busy: loading }}>
      <Animated.View
        style={contentStyle}
        pointerEvents={loading ? "none" : "auto"}
        accessibilityElementsHidden={loading}
        importantForAccessibility={loading ? "no-hide-descendants" : "auto"}
      >
        {children}
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, skeletonStyle]}
      >
        <YerbaCardSkeleton />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    minHeight: 246,
    flex: 1,
    borderRadius: t.radius.card,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    overflow: "hidden",
  },
  block: { backgroundColor: t.colors.sage, borderRadius: 6 },
  copy: { width: "53%", padding: t.spacing.md, gap: 14 },
  pack: {
    position: "absolute",
    left: "62%",
    right: 18,
    top: 48,
    bottom: 18,
    backgroundColor: t.colors.sage,
    borderRadius: t.radius.control,
  },
  favorite: {
    position: "absolute",
    width: 22,
    height: 22,
    right: 16,
    top: 16,
    backgroundColor: t.colors.sage,
    borderRadius: t.radius.pill,
  },
});
