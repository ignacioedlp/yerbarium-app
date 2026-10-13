import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { theme as t } from "@/theme";

export type SkeletonVariant = "content" | "detail" | "header" | "chips";

export function ContentLoadingTransition({
  loading,
  variant,
  children,
}: React.PropsWithChildren<{
  loading: boolean;
  variant: SkeletonVariant;
}>) {
  // Start cached content fully visible; fade only after an actual loading state.
  const progress = useSharedValue(loading ? 0 : 1);
  React.useEffect(() => {
    cancelAnimation(progress);
    progress.set(
      loading
        ? 0
        : withTiming(1, {
            duration: 280,
            easing: Easing.bezier(0.23, 1, 0.32, 1),
            reduceMotion: ReduceMotion.System,
          }),
    );
    return () => cancelAnimation(progress);
  }, [loading, progress]);
  const contentStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.get(),
  }));

  return (
    <View>
      {!loading && (
        <Animated.View
          style={[
            { gap: variant === "content" ? t.spacing.sm : t.spacing.lg },
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      )}
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden={!loading}
        importantForAccessibility={loading ? "auto" : "no-hide-descendants"}
        style={[!loading && StyleSheet.absoluteFill, skeletonStyle]}
      >
        <ContentSkeleton variant={variant} />
      </Animated.View>
    </View>
  );
}

export function ContentSkeleton({
  variant = "content",
}: {
  variant?: SkeletonVariant;
}) {
  return (
    <View
      testID={`loading-skeleton-${variant}`}
      accessible
      accessibilityLabel="Cargando contenido"
      accessibilityState={{ busy: true }}
      pointerEvents="none"
      style={s.container}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={s.container}
      >
        {variant === "chips" ? (
          <View style={s.row}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={[s.block, s.chip]} />
            ))}
          </View>
        ) : (
          <>
            <View style={[s.block, s.heading]} />
            <View style={[s.block, s.subtitle]} />
            {variant === "detail" && <View style={[s.block, s.image]} />}
            <View style={[s.block, s.line]} />
            <View style={[s.block, s.line, { width: "84%" }]} />
            <View style={[s.block, s.line, { width: "62%" }]} />
            {variant !== "content" && (
              <View style={s.row}>
                <View style={[s.block, s.chip]} />
                <View style={[s.block, s.chip]} />
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: t.spacing.md },
  block: { backgroundColor: t.colors.sage, borderRadius: t.radius.control },
  heading: { width: "72%", height: 32 },
  subtitle: { width: "38%", height: 14 },
  line: { width: "100%", height: 14 },
  image: { width: "100%", height: 280 },
  row: { flexDirection: "row", gap: t.spacing.sm },
  chip: { flex: 1, height: 44, borderRadius: t.radius.pill },
});
