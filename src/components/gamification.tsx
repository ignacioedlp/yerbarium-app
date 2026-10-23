import React, { useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  groupAchievements,
  progressRatio,
  type GamificationBadge,
  type OwnGamification,
} from "@/api/gamification";
import { useGamification } from "@/hooks/gamification";
import { tr, useLocale } from "@/i18n";
import { useTheme } from "@/theme";
import { Body, Button, Card, QueryState, useUIStyles } from "./ui";
import { Icon } from "./icon";

export function BadgeImage({
  badge,
  size = 64,
  level,
}: {
  badge: GamificationBadge;
  size?: number;
  level?: number;
}) {
  const t = useTheme();
  const styles = useUIStyles();
  useLocale();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return badge.image_url && badge.image_url !== failedUrl ? (
    <Image
      source={badge.image_url}
      accessibilityLabel={badge.image_alt_text || tr(badge.name)}
      contentFit="contain"
      style={{ width: size, height: size, flexShrink: 0 }}
      onError={() => setFailedUrl(badge.image_url)}
    />
  ) : (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: t.colors.sage,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {level === undefined ? (
        <Icon name="star" size={28} />
      ) : (
        <Text style={[styles.title, { fontSize: 32 }]}>{level}</Text>
      )}
    </View>
  );
}

export function ProgressBar({
  value,
  maximum = 1,
  label,
}: {
  value: number;
  maximum?: number;
  label: string;
}) {
  const t = useTheme();
  const ratio = progressRatio(value, maximum);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      style={{
        height: 8,
        borderRadius: t.radius.pill,
        backgroundColor: t.colors.sage,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${ratio * 100}%`,
          backgroundColor: t.colors.hero,
          borderRadius: t.radius.pill,
        }}
      />
    </View>
  );
}

export function LevelProgress({ data }: { data: OwnGamification }) {
  const t = useTheme();
  const styles = useUIStyles();
  useLocale();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <View
        style={{
          flexDirection: "row",
          gap: t.spacing.md,
          alignItems: "center",
        }}
      >
        <BadgeImage badge={data} size={80} level={data.level} />
        <View style={{ flex: 1, gap: t.spacing.xs }}>
          <Text style={styles.muted}>{tr("Tu recorrido matero")}</Text>
          <Text selectable style={[styles.body, { fontFamily: t.fonts.bold }]}>
            {tr("Nivel {0}: {1}", { 0: data.level, 1: tr(data.name) })}
          </Text>
          <Text
            selectable
            style={[styles.body, { fontVariant: ["tabular-nums"] }]}
          >
            {tr("{0} XP", { 0: data.total_xp })}
          </Text>
        </View>
      </View>
      <ProgressBar
        value={data.next_threshold === null ? 1 : data.progress}
        label={tr("Progreso al siguiente nivel")}
      />
      <Body muted>
        {data.next_threshold === null
          ? tr("Alcanzaste el nivel máximo")
          : tr("Te faltan {0} XP para el próximo nivel", {
              0: data.xp_to_next,
            })}
      </Body>
    </View>
  );
}

export function ProfileGamification() {
  useLocale();
  const query = useGamification();
  const completed = query.data
    ? groupAchievements(query.data.achievements).completed.length
    : 0;
  return (
    <Card>
      <QueryState query={query} skeleton="header">
        {query.data && (
          <>
            <LevelProgress data={query.data} />
            <Body muted>
              {tr("{0} de {1} logros completados", {
                0: completed,
                1: query.data.achievements.length,
              })}
            </Body>
          </>
        )}
      </QueryState>
      <Button
        label={tr("Ver mis logros")}
        secondary
        onPress={() => router.push("/logros")}
      />
    </Card>
  );
}
