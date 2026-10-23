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
import { theme as t } from "@/theme";

// Coordinates are fractions of recorrido.webp (1086 × 1448), never of the viewport.
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
          experimental_backgroundImage:
            "radial-gradient(ellipse 85% 65% at 0% 0%, #fff8e8 0%, rgba(255,248,232,0.96) 60%, rgba(255,248,232,0) 100%)",
        }}
      />
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
                  left: -18,
                  top: -18,
                  width: badgeSize + 36,
                  height: badgeSize + 36,
                  experimental_backgroundImage:
                    "radial-gradient(circle, rgba(255,211,72,0.72) 0%, rgba(255,211,72,0.38) 42%, rgba(255,211,72,0) 74%)",
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
                backgroundColor: current ? t.colors.green : "#676b57",
                borderColor: current ? "#f6d15b" : t.colors.cream,
                borderWidth: selected ? 3 : 2,
                boxShadow: current ? "none" : "0 2px 5px #00000040",
              }}
            >
              {level.image_url ? (
                <BadgeImage
                  badge={level}
                  size={badgeSize + 10}
                  level={level.level}
                />
              ) : (
                <Text
                  style={{
                    fontFamily: t.fonts.bold,
                    color: t.colors.cream,
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
                  backgroundColor: current ? t.colors.cream : "#f4efdfed",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: t.fonts.bold,
                      color: current ? t.colors.green : "#42483d",
                      fontSize: 10,
                    }}
                  >
                    {tr("Nivel {0}", { 0: level.level })}
                  </Text>
                  <Text
                    style={{
                      fontFamily: t.fonts.bold,
                      color: current ? t.colors.green : "#42483d",
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
                    tintColor="#606454"
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
  useLocale();
  const { user } = useSession();
  const query = useGamification();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [width, setWidth] = useState(windowWidth);
  const [height, setHeight] = useState(windowHeight);
  const [expanded, setExpanded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [summaryHeight, setSummaryHeight] = useState(160);
  const mapScrollRef = React.useRef<ScrollView>(null);
  const panelTop = insets.top * 2 + 16;
  const panelHeight = Math.max(
    summaryHeight,
    height - panelTop - insets.bottom,
  );
  const collapsedOffset = Math.max(0, panelHeight - summaryHeight);
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
  // Keep the map behind the collapsed sheet when the measured viewport is
  // taller than the artwork's natural aspect-ratio height.
  const mapHeight = Math.max(
    (width * 1448) / 1086 + insets.top + 48,
    height - insets.bottom - summaryHeight,
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
        contentContainerStyle={{ paddingBottom: summaryHeight + insets.bottom }}
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
                  width: width * 0.4,
                  gap: 3,
                }}
              >
                <Text
                  accessibilityRole="header"
                  numberOfLines={2}
                  style={{
                    fontFamily: t.fonts.display,
                    color: t.colors.deep,
                    fontSize: 29,
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
            backgroundColor: t.colors.green,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="settings" color={t.colors.cream} size={23} />
        </Pressable>
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: panelTop,
          bottom: insets.bottom,
          left: 0,
          right: 0,
          overflow: "hidden",
        }}
      >
        <Animated.View
          testID="profile-library-sheet"
          style={[
            {
              height: panelHeight,
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
                              : query.data.progress
                          }
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
