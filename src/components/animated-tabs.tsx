import { tr, countLabel, useLocale } from "@/i18n";
import React from "react";
import { Pressable, Text, View } from "react-native";
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
  const indicatorX = useSharedValue(0);
  const selectedIndex = options.findIndex((option) => option.key === selected);

  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
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
    [onSelect, options, selectedIndex],
  );

  React.useEffect(() => {
    indicatorX.set(
      withTiming((Math.max(0, selectedIndex) * tabsWidth) / options.length, {
        duration: 200,
        easing: Easing.bezier(0.77, 0, 0.175, 1),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [indicatorX, options.length, selectedIndex, tabsWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
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
            onPress={() => onSelect(key)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 48,
              paddingHorizontal: theme.spacing.xs,
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
                style={{
                  color:
                    selected === key ? theme.colors.green : theme.colors.muted,
                  fontFamily:
                    selected === key ? theme.fonts.bold : theme.fonts.body,
                  fontSize: 15,
                  textAlign: "center",
                  flexShrink: 1,
                }}
              >
                {tr(label)}
              </Text>
              {count !== undefined && (
                <Text
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
              width: options.length ? tabsWidth / options.length : 0,
              backgroundColor: theme.colors.hero,
            },
            indicatorStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}
