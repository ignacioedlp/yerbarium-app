import React, { useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { GamificationLevel, OwnGamification } from "@/api/gamification";
import { groupAchievements } from "@/api/gamification";
import { BadgeImage, ProgressBar } from "@/components/gamification";
import { Paper } from "@/components/editorial";
import { Icon } from "@/components/icon";
import { ProfileLibrary } from "@/components/profile-library";
import { OwnProfileSocial } from "@/components/profile-social";
import {
  Body,
  Button,
  OfflineBanner,
  QueryState,
  Title,
} from "@/components/ui";
import { learningLinks } from "@/content/learning";
import { useGamification } from "@/hooks/gamification";
import { tr, useLocale } from "@/i18n";
import { useSession } from "@/providers/session";
import { EmailVerificationStatus } from "@/screens/email-actions";
import { useTheme } from "@/theme";

// Coordinates are fractions of recorrido.webp (1024 × 1536), never of the viewport.
export const JOURNEY_STOPS = [
  { x: 0.5, y: 0.86 },
  { x: 0.44, y: 0.73 },
  { x: 0.56, y: 0.65 },
  { x: 0.4, y: 0.57 },
  { x: 0.59, y: 0.52 },
  { x: 0.45, y: 0.48 },
  { x: 0.57, y: 0.32 },
  { x: 0.48, y: 0.24 },
  { x: 0.68, y: 0.18 },
  { x: 0.74, y: 0.1 },
] as const;

// Each leg follows the bends painted into the artwork, from one stop to the next.
// Use the same canvas as the image and badges so stretching/scrolling stays aligned.
const JOURNEY_LEGS = [
  [
    [0.44, 0.85, 0.33, 0.835, 0.37, 0.81],
    [0.4, 0.79, 0.51, 0.77, 0.47, 0.75],
    [0.46, 0.742, 0.445, 0.737, 0.44, 0.73],
  ],
  [
    [0.39, 0.71, 0.35, 0.695, 0.38, 0.685],
    [0.43, 0.669, 0.61, 0.668, 0.56, 0.65],
  ],
  [
    [0.51, 0.63, 0.5, 0.612, 0.45, 0.605],
    [0.36, 0.593, 0.3, 0.577, 0.4, 0.57],
  ],
  [
    [0.46, 0.558, 0.53, 0.56, 0.52, 0.54],
    [0.51, 0.53, 0.49, 0.525, 0.59, 0.52],
  ],
  [[0.56, 0.512, 0.42, 0.5, 0.45, 0.48]],
  [
    [0.49, 0.463, 0.66, 0.459, 0.6, 0.435],
    [0.55, 0.42, 0.51, 0.425, 0.55, 0.408],
    [0.61, 0.385, 0.43, 0.384, 0.46, 0.353],
    [0.48, 0.335, 0.6, 0.336, 0.57, 0.32],
  ],
  [
    [0.54, 0.305, 0.43, 0.3, 0.45, 0.27],
    [0.45, 0.258, 0.47, 0.248, 0.48, 0.24],
  ],
  [
    [0.54, 0.223, 0.68, 0.239, 0.64, 0.22],
    [0.61, 0.204, 0.67, 0.202, 0.68, 0.18],
  ],
  [
    [0.69, 0.162, 0.64, 0.167, 0.68, 0.15],
    [0.7, 0.137, 0.75, 0.145, 0.74, 0.13],
    [0.72, 0.117, 0.73, 0.11, 0.74, 0.1],
  ],
] as const;

function CompletedJourney({
  level,
  width,
  height,
}: {
  level: number;
  width: number;
  height: number;
}) {
  const completedLegs = Math.max(0, Math.min(JOURNEY_LEGS.length, level - 1));
  if (!completedLegs) return null;
  const dots: { x: number; y: number }[] = [];
  let start: { x: number; y: number } = JOURNEY_STOPS[0];
  let previous = { x: start.x * width, y: start.y * height };
  let distanceToNext = 0;
  for (const leg of JOURNEY_LEGS.slice(0, completedLegs)) {
    for (const [x1, y1, x2, y2, x3, y3] of leg) {
      // Subdivide the curves, then space dots by distance in screen points.
      for (let step = 1; step <= 100; step++) {
        const t = step / 100;
        const u = 1 - t;
        const point = {
          x:
            (u ** 3 * start.x +
              3 * u ** 2 * t * x1 +
              3 * u * t ** 2 * x2 +
              t ** 3 * x3) *
            width,
          y:
            (u ** 3 * start.y +
              3 * u ** 2 * t * y1 +
              3 * u * t ** 2 * y2 +
              t ** 3 * y3) *
            height,
        };
        const length = Math.hypot(point.x - previous.x, point.y - previous.y);
        if (length > 0) {
          for (; distanceToNext <= length; distanceToNext += 6.5) {
            const fraction = distanceToNext / length;
            dots.push({
              x: previous.x + (point.x - previous.x) * fraction,
              y: previous.y + (point.y - previous.y) * fraction,
            });
          }
          distanceToNext -= length;
        }
        previous = point;
      }
      start = { x: x3, y: y3 };
    }
  }
  return (
    <View
      testID="journey-completed-path"
      accessible={false}
      pointerEvents="none"
      style={{ position: "absolute", width, height }}
    >
      {dots.map((dot, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            left: dot.x - 2.25,
            top: dot.y - 2.25,
            width: 4.5,
            height: 4.5,
            borderRadius: 2.25,
            backgroundColor: "white",
            boxShadow: "0 1px 3px rgba(0, 65, 45, 0.5)",
          }}
        />
      ))}
    </View>
  );
}

// Compatibility with an API deployment preceding the level catalogue response.
const LEVEL_NAMES = [
  "Primer Cebado",
  "Mate en Mano",
  "Ronda Abierta",
  "Paladar Inquieto",
  "Explorador de Sabores",
  "Alma Matera",
  "Paladar Curtido",
  "Guardián de la Ronda",
  "Maestro Cebador",
  "Leyenda de la Ronda",
];

const JOURNEY_CONTENT_OFFSET = 40;

function JourneyMap({
  data,
  width,
  height,
  selectedLevel,
  onSelectLevel,
}: {
  data: OwnGamification;
  width: number;
  height: number;
  selectedLevel: number | null;
  onSelectLevel: (level: number | null) => void;
}) {
  const t = useTheme();
  const badgeSize = Math.max(32, Math.min(48, width * 0.05));
  const labelWidth = Math.min(width * 0.34, 150);
  const levels: GamificationLevel[] =
    data.levels ??
    LEVEL_NAMES.map((name, index) => ({
      name,
      level: index + 1,
      min_xp: 0,
      icon_key: `level-${index + 1}`,
      image_url: null,
      image_alt_text: "",
      ...(data.level === index + 1
        ? {
            name: data.name,
            image_url: data.image_url,
            image_alt_text: data.image_alt_text,
          }
        : {}),
    }));
  return (
    <View testID="profile-journey-map" style={{ width, height }}>
      <Image
        source={require("../../assets/images/recorrido.webp")}
        contentFit="fill"
        accessible={false}
        style={{ position: "absolute", width, height }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          inset: 0,
          experimental_backgroundImage: t.colors.journeyFade,
        }}
      />
      <CompletedJourney level={data.level} width={width} height={height} />
      {levels.map((level) => {
        const stop = JOURNEY_STOPS[level.level - 1];
        if (!stop) return null;
        const current = level.level === data.level;
        const locked = level.level > data.level;
        const summit = level.level >= 9;
        const selected = selectedLevel === level.level;
        return (
          <Pressable
            key={level.level}
            accessibilityRole="button"
            accessibilityLabel={`${tr("Nivel {0}: {1}", { 0: level.level, 1: tr(level.name) })}. ${tr(locked ? "Pendiente" : current ? "Tu recorrido matero" : "Completado")}`}
            testID={`journey-level-${level.level}`}
            onPress={() => onSelectLevel(selected ? null : level.level)}
            style={({ pressed }) => ({
              position: "absolute",
              left: width * stop.x - badgeSize / 2,
              top: height * stop.y - badgeSize / 2,
              width: badgeSize,
              height: badgeSize,
              opacity: pressed ? 0.7 : 1,
              zIndex: current ? 2 : 1,
            })}
          >
            {current && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: -26,
                  top: -26,
                  width: badgeSize + 52,
                  height: badgeSize + 52,
                  experimental_backgroundImage:
                    "radial-gradient(circle, rgba(255,250,219,0.82) 0%, rgba(255,235,143,0.65) 30%, rgba(255,211,72,0.4) 48%, rgba(255,211,72,0.12) 64%, rgba(255,211,72,0) 76%)",
                }}
              />
            )}
            <View
              style={{
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: locked
                  ? t.dark
                    ? t.colors.sage
                    : "rgba(231,235,213,0.65)"
                  : current
                    ? t.colors.hero
                    : "#676b57",
                borderColor: "#f6d15b",
                borderWidth: current ? 3 : 0,
                boxShadow: locked || current ? "none" : "0 2px 5px #00000040",
              }}
            >
              {locked ? (
                <SymbolView
                  testID={`journey-level-${level.level}-locked`}
                  name={{ ios: "lock.fill", android: "lock" }}
                  tintColor={t.colors.green}
                  size={badgeSize * 0.48}
                />
              ) : level.image_url ? (
                <BadgeImage
                  badge={level}
                  size={badgeSize + 10}
                  level={level.level}
                />
              ) : (
                <Text
                  style={{
                    fontFamily: t.fonts.bold,
                    color: t.colors.onDark,
                    fontSize: badgeSize * 0.52,
                  }}
                >
                  {level.level}
                </Text>
              )}
            </View>
            {selected && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: summit ? badgeSize + 5 : 0,
                  ...(stop.x > 0.57
                    ? { right: badgeSize + 6 }
                    : { left: badgeSize + 6 }),
                  width: labelWidth,
                  minHeight: badgeSize,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  borderRadius: 10,
                  backgroundColor: current
                    ? t.colors.cream
                    : t.colors.journeyLabel,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: t.fonts.bold,
                      color: current ? t.colors.green : t.colors.journeyInk,
                      fontSize: 10,
                    }}
                  >
                    {tr("Nivel {0}", { 0: level.level })}
                  </Text>
                  <Text
                    style={{
                      fontFamily: t.fonts.bold,
                      color: current ? t.colors.green : t.colors.journeyInk,
                      fontSize: 11,
                      lineHeight: 13,
                    }}
                  >
                    {tr(level.name)}
                  </Text>
                </View>
                {locked && (
                  <SymbolView
                    name={{ ios: "lock.fill", android: "lock" }}
                    tintColor={t.colors.muted}
                    size={12}
                  />
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function ProfileDetails({ close }: { close: () => void }) {
  const t = useTheme();
  const { user, logout } = useSession();
  const navigate = (action: () => void) => {
    close();
    action();
  };
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={{
        padding: 24,
        paddingTop: 20,
        paddingBottom: 32,
        gap: 24,
      }}
    >
      <ProfileLibrary />
      <EmailVerificationStatus />
      <View style={{ gap: 8 }}>
        <Button
          label={tr("Editar perfil")}
          onPress={() => navigate(() => router.push("/editar-perfil"))}
        />
        <Button
          label={tr("Ver perfil público")}
          secondary
          onPress={() =>
            navigate(() =>
              router.push({
                pathname: "/usuarios/[username]",
                params: { username: user!.username },
              }),
            )
          }
        />
      </View>
      <View style={{ gap: 12 }}>
        <Title>{tr("Aprende")}</Title>
        {learningLinks.map(({ article, label }) => (
          <Pressable
            key={article}
            accessibilityRole="link"
            onPress={() =>
              navigate(() =>
                router.push({
                  pathname: "/editorial/[article]",
                  params: { article },
                }),
              )
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 48,
              borderBottomWidth: 1,
              borderColor: t.colors.subtleBorder,
            }}
          >
            <Body>{tr(label)}</Body>
            <Icon name="arrow" />
          </Pressable>
        ))}
      </View>
      <Button
        label={tr("Cerrar sesión")}
        secondary
        onPress={() => {
          close();
          void logout();
        }}
      />
    </ScrollView>
  );
}

export function ProfileJourney() {
  const t = useTheme();
  useLocale();
  const { user } = useSession();
  const query = useGamification();
  const insets = useSafeAreaInsets();
  // Android NativeTabs already applies the bottom safe area to its content.
  // The measured viewport ends above the tab bar, including three-button navigation.
  const bottomInset = process.env.EXPO_OS === "android" ? 0 : insets.bottom;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [width, setWidth] = useState(windowWidth);
  const [height, setHeight] = useState(windowHeight);
  const [expanded, setExpanded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [summaryHeight, setSummaryHeight] = useState(160);
  const mapScrollRef = React.useRef<ScrollView>(null);
  const panelTop = insets.top * 2 + 16;
  const panelHeight = Math.max(summaryHeight, height - panelTop - bottomInset);
  const sheetOverlap = process.env.EXPO_OS === "android" ? 12 : 0;
  const collapsedOffset = Math.max(
    0,
    panelHeight - summaryHeight - sheetOverlap,
  );
  const offset = useSharedValue(collapsedOffset);
  const dragStart = useSharedValue(0);
  const expandedRef = React.useRef(expanded);
  React.useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);
  // Recalculate geometry on rotation or Dynamic Type changes, without replaying the animation.
  React.useEffect(() => {
    cancelAnimation(offset);
    offset.set(expandedRef.current ? 0 : collapsedOffset);
  }, [collapsedOffset, offset]);
  const setPanelExpanded = React.useCallback(
    (open: boolean) => {
      setExpanded(open);
      offset.set(
        withSpring(open ? 0 : collapsedOffset, {
          duration: 300,
          dampingRatio: 0.8,
          overshootClamping: true,
          reduceMotion: ReduceMotion.System,
        }),
      );
    },
    [collapsedOffset, offset],
  );
  const collapse = React.useCallback(
    () => setPanelExpanded(false),
    [setPanelExpanded],
  );
  useFocusEffect(
    React.useCallback(() => {
      mapScrollRef.current?.scrollTo({ y: 0, animated: false });
    }, []),
  );
  useFocusEffect(
    React.useCallback(() => {
      if (!expanded) return;
      const back = BackHandler.addEventListener("hardwareBackPress", () => {
        collapse();
        return true;
      });
      return () => back.remove();
    }, [expanded, collapse]),
  );
  const pan = usePanGesture({
    activeOffsetY: [-8, 8],
    onActivate: () => {
      "worklet";
      cancelAnimation(offset);
      dragStart.set(offset.get());
      scheduleOnRN(setExpanded, true);
    },
    onUpdate: (event) => {
      "worklet";
      offset.set(
        Math.max(
          0,
          Math.min(collapsedOffset, dragStart.get() + event.translationY),
        ),
      );
    },
    onDeactivate: (event) => {
      "worklet";
      const open = offset.get() + event.velocityY * 0.2 < collapsedOffset / 2;
      offset.set(
        withSpring(
          open ? 0 : collapsedOffset,
          {
            duration: 300,
            dampingRatio: 0.8,
            velocity: event.velocityY,
            overshootClamping: true,
            reduceMotion: ReduceMotion.System,
          },
          (finished) => {
            if (finished) scheduleOnRN(setExpanded, open);
          },
        ),
      );
    },
  });
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.get() }],
  }));
  // The image and all its markers share one canvas, including the header's space.
  // Android's opaque tabs reduce the viewport: fit the full journey above the
  // collapsed sheet. iOS keeps the artwork extending behind its floating tabs.
  const mapHeight =
    process.env.EXPO_OS === "android"
      ? Math.max(1, height - summaryHeight - JOURNEY_CONTENT_OFFSET)
      : Math.max(
          (width * 1448) / 1086 + insets.top + 48,
          height - bottomInset - summaryHeight,
        );
  const completed = groupAchievements(query.data?.achievements ?? []).completed
    .length;
  return (
    <View
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
        setHeight(event.nativeEvent.layout.height);
      }}
      style={{
        flex: 1,
        marginTop: -insets.top,
        backgroundColor: t.colors.surface,
        overflow: "hidden",
      }}
    >
      <ScrollView
        ref={mapScrollRef}
        accessibilityElementsHidden={expanded}
        importantForAccessibility={expanded ? "no-hide-descendants" : "auto"}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: summaryHeight + bottomInset }}
      >
        <QueryState query={query} skeleton="header">
          {query.data && (
            <View
              style={{ transform: [{ translateY: JOURNEY_CONTENT_OFFSET }] }}
            >
              <JourneyMap
                data={query.data}
                width={width}
                height={mapHeight}
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
              />
              <View
                style={{
                  position: "absolute",
                  left: 24,
                  top: insets.top * 2 + JOURNEY_CONTENT_OFFSET,
                  width:
                    width * (process.env.EXPO_OS === "android" ? 0.52 : 0.4),
                  gap: 3,
                }}
              >
                <Text
                  accessibilityRole="header"
                  numberOfLines={2}
                  adjustsFontSizeToFit={process.env.EXPO_OS === "android"}
                  minimumFontScale={0.7}
                  style={{
                    fontFamily: t.fonts.display,
                    color: t.colors.green,
                    fontSize: 29,
                    ...(process.env.EXPO_OS === "android"
                      ? { lineHeight: 34 }
                      : {}),
                    textTransform: "uppercase",
                  }}
                >
                  {user?.display_name || user?.username}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      flexShrink: 1,
                      fontFamily: t.fonts.body,
                      color: t.colors.muted,
                      fontSize: 14,
                    }}
                  >
                    @{user?.username}
                  </Text>
                  {user?.email_verified && (
                    <View
                      accessibilityLabel={tr("Email verificado")}
                      accessible
                    >
                      <Icon name="verified" size={17} />
                    </View>
                  )}
                </View>
                <OwnProfileSocial compact />
                {user?.bio ? (
                  <Text
                    numberOfLines={3}
                    style={{
                      fontFamily: t.fonts.hand,
                      color: t.colors.green,
                      fontSize: 21,
                      lineHeight: 23,
                    }}
                  >
                    {user.bio}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </QueryState>
      </ScrollView>
      <View
        accessibilityElementsHidden={expanded}
        importantForAccessibility={expanded ? "no-hide-descendants" : "auto"}
        style={{
          position: "absolute",
          top: insets.top * 2 + 8,
          left: 24,
          right: 24,
          height: 48,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>{tr("Perfil")}</Title>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Ajustes")}
          testID="profile-settings"
          onPress={() => router.push("/ajustes")}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: t.colors.action,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="settings" color={t.colors.onAction} size={23} />
        </Pressable>
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: panelTop,
          bottom: 0,
          left: 0,
          right: 0,
          overflow: "hidden",
        }}
      >
        <Animated.View
          testID="profile-library-sheet"
          style={[
            {
              // Continue the sheet surface behind iOS floating tabs while keeping
              // its summary and drag positions above the navigation safe area.
              height: panelHeight + bottomInset,
              paddingBottom: bottomInset,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              backgroundColor: t.colors.surface,
              overflow: "hidden",
              boxShadow: "0 -4px 20px #153d3215",
            },
            panelStyle,
          ]}
        >
          <Paper />
          <GestureDetector gesture={pan}>
            <View
              onLayout={(event) =>
                setSummaryHeight(event.nativeEvent.layout.height)
              }
              testID="profile-sheet-preview"
              style={{
                flexShrink: 0,
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 16,
                gap: 8,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr(expanded ? "Cerrar" : "Mi biblioteca")}
                accessibilityState={{ expanded }}
                testID="profile-expand-sheet"
                onPress={() => setPanelExpanded(!expanded)}
                style={{ alignItems: "center", paddingVertical: 6 }}
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: t.colors.border,
                  }}
                />
              </Pressable>
              <QueryState query={query} skeleton="header">
                {query.data && (
                  <View style={{ gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 14,
                        alignItems: "center",
                      }}
                    >
                      <BadgeImage
                        badge={query.data}
                        level={query.data.level}
                        size={64}
                      />
                      <View style={{ flex: 1, gap: 5 }}>
                        <Text
                          style={{
                            fontFamily: t.fonts.bold,
                            color: t.colors.green,
                            fontSize: 16,
                          }}
                        >
                          {tr("Nivel {0}: {1}", {
                            0: query.data.level,
                            1: tr(query.data.name),
                          })}
                        </Text>
                        <Text
                          style={{
                            fontFamily: t.fonts.body,
                            color: t.colors.muted,
                            fontSize: 14,
                          }}
                        >
                          {tr("{0} XP", { 0: query.data.total_xp })}
                        </Text>
                        <ProgressBar
                          value={
                            query.data.next_threshold === null
                              ? 1
                              : query.data.total_xp
                          }
                          maximum={query.data.next_threshold ?? 1}
                          label={tr("Progreso al siguiente nivel")}
                        />
                        <Text
                          style={{
                            fontFamily: t.fonts.body,
                            color: t.colors.muted,
                            fontSize: 11,
                          }}
                        >
                          {query.data.next_threshold === null
                            ? tr("Alcanzaste el nivel máximo")
                            : tr("Te faltan {0} XP para el próximo nivel", {
                                0: query.data.xp_to_next,
                              })}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <Pressable
                        accessibilityRole="link"
                        onPress={() => router.push("/logros")}
                        style={{ minHeight: 36, justifyContent: "center" }}
                      >
                        <Text
                          style={{
                            color: t.colors.muted,
                            fontFamily: t.fonts.body,
                            fontSize: 12,
                          }}
                        >
                          {tr("{0} de {1} logros completados", {
                            0: completed,
                            1: query.data.achievements.length,
                          })}{" "}
                          ›
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setPanelExpanded(!expanded)}
                        style={{ minHeight: 36, justifyContent: "center" }}
                      >
                        <Text
                          style={{
                            color: t.colors.green,
                            fontFamily: t.fonts.bold,
                            fontSize: 13,
                          }}
                        >
                          {tr("Mi biblioteca")} {expanded ? "↓" : "↑"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </QueryState>
            </View>
          </GestureDetector>
          {expanded && <ProfileDetails close={collapse} />}
        </Animated.View>
      </View>
      <View
        style={{
          position: "absolute",
          top: insets.top * 2 + 56,
          left: 24,
          right: 24,
        }}
      >
        <OfflineBanner />
      </View>
    </View>
  );
}
