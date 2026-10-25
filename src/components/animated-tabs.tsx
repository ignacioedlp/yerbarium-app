import { tr, countLabel, useLocale } from "@/i18n";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/theme";

const CONTENT_ENTER = FadeIn.duration(140)
  .easing(Easing.bezier(0.23, 1, 0.32, 1))
  .reduceMotion(ReduceMotion.System);

export type AnimatedTabOption<Key extends string> = {
  key: Key;
  label: string;
  count?: number;
};

export function AnimatedTabContent({
  activeKey,
  children,
}: React.PropsWithChildren<{ activeKey: string }>) {
  useLocale();
  const reducedMotion = useReducedMotion();
  return (
    <Animated.View
      key={activeKey}
      entering={reducedMotion ? undefined : CONTENT_ENTER}
    >
      {children}
    </Animated.View>
  );
}

export function AnimatedTabs<Key extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly AnimatedTabOption<Key>[];
  selected: Key;
  onSelect: (key: Key) => void;
}) {
  const theme = useTheme();
  useLocale();
  const [tabsWidth, setTabsWidth] = React.useState(0);
  const [contentWidth, setContentWidth] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = React.useState<
    Record<string, { x: number; width: number }>
  >({});
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const selectedIndex = options.findIndex((option) => option.key === selected);

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(contentWidth <= tabsWidth)
        .activeOffsetX([-20, 20])
        .failOffsetY([-15, 15])
        .runOnJS(true)
        .onEnd((event) => {
          if (Math.abs(event.translationX) < 50) return;
          if (selectedIndex < 0 || options.length < 2) return;
          const nextIndex = Math.max(
            0,
            Math.min(
              options.length - 1,
              selectedIndex + (event.translationX < 0 ? 1 : -1),
            ),
          );
          if (nextIndex !== selectedIndex) {
            onSelect(options[nextIndex].key);
          }
        }),
    [contentWidth, tabsWidth, onSelect, options, selectedIndex],
  );

  React.useEffect(() => {
    const layout = tabLayouts[selected];
    if (!layout) return;
    const animation = {
      duration: 200,
      easing: Easing.bezier(0.77, 0, 0.175, 1),
      reduceMotion: ReduceMotion.System,
    };
    indicatorX.set(withTiming(layout.x, animation));
    indicatorWidth.set(withTiming(layout.width, animation));
    scrollRef.current?.scrollTo({
      x: Math.max(0, layout.x - (tabsWidth - layout.width) / 2),
      animated: !reducedMotion,
    });
  }, [
    indicatorX,
    indicatorWidth,
    selected,
    tabLayouts,
    tabsWidth,
    reducedMotion,
  ]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: indicatorWidth.get(),
    transform: [{ translateX: indicatorX.get() }],
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <View
        accessibilityRole="tablist"
        onLayout={({ nativeEvent }) => setTabsWidth(nativeEvent.layout.width)}
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          onContentSizeChange={(width) => setContentWidth(width)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {options.map(({ key, label, count }) => (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: selected === key }}
              accessibilityLabel={
                count === undefined
                  ? tr(label)
                  : `${tr(label)}, ${countLabel(count, "{count} elemento", "{count} elementos")}`
              }
              onLayout={({ nativeEvent: { layout } }) => {
                setTabLayouts((previous) => {
                  if (
                    previous[key]?.x === layout.x &&
                    previous[key]?.width === layout.width
                  ) {
                    return previous;
                  }
                  return {
                    ...previous,
                    [key]: { x: layout.x, width: layout.width },
                  };
                });
              }}
              onPress={() => onSelect(key)}
              style={({ pressed }) => ({
                flexGrow: 1,
                flexShrink: 0,
                minWidth: options.length ? tabsWidth / options.length : 0,
                minHeight: 48,
                paddingHorizontal: theme.spacing.sm,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: theme.spacing.xs,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color:
                      selected === key
                        ? theme.colors.green
                        : theme.colors.muted,
                    fontFamily:
                      selected === key ? theme.fonts.bold : theme.fonts.body,
                    fontSize: 15,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  {tr(label)}
                </Text>
                {count !== undefined && (
                  <Text
                    numberOfLines={1}
                    style={{
                      color:
                        selected === key
                          ? theme.colors.green
                          : theme.colors.muted,
                      fontFamily: theme.fonts.bold,
                      fontSize: 13,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {count}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
          <Animated.View
            pointerEvents="none"
            accessible={false}
            style={[
              {
                position: "absolute",
                left: 0,
                bottom: 0,
                height: 3,
                backgroundColor: theme.colors.green,
              },
              indicatorStyle,
            ]}
          />
        </ScrollView>
      </View>
    </GestureDetector>
  );
}
