import React from "react";
import { Text, View } from "react-native";
import { groupAchievements, type Achievement } from "@/api/gamification";
import {
  BadgeImage,
  LevelProgress,
  ProgressBar,
} from "@/components/gamification";
import {
  Body,
  Card,
  Page,
  QueryState,
  RequireSession,
  styles,
} from "@/components/ui";
import { useGamification } from "@/hooks/gamification";
import { tr, useLocale } from "@/i18n";
import { theme as t } from "@/theme";
import { Paper } from "@/components/editorial";

function AchievementCard({ award }: { award: Achievement }) {
  useLocale();
  const completed = award.status === "unlocked";
  const progressLabel = {
    tried: "Yerbas probadas: {0} de {1}",
    reviews: "Opiniones publicadas: {0} de {1}",
    brands: "Marcas probadas: {0} de {1}",
  }[award.metric];
  return (
    <View
      style={[
        styles.card,
        completed && { borderColor: t.colors.green, borderWidth: 2 },
      ]}
    >
      <Paper />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing.md,
        }}
      >
        <BadgeImage badge={award} />
        <View style={{ flex: 1, gap: t.spacing.xs }}>
          <Text selectable style={[styles.body, { fontFamily: t.fonts.bold }]}>
            {tr(award.name)}
          </Text>
          <Text
            style={[
              styles.muted,
              {
                fontFamily: t.fonts.bold,
                color: completed ? t.colors.green : t.colors.muted,
              },
            ]}
          >
            {tr(
              completed
                ? "Completado"
                : award.status === "revoked"
                  ? "Revocado"
                  : "Pendiente",
            )}
          </Text>
          <Body muted>{tr("{0} XP", { 0: award.reward_xp })}</Body>
        </View>
      </View>
      <Text selectable style={[styles.body, { fontVariant: ["tabular-nums"] }]}>
        {tr(progressLabel, {
          0: award.progress,
          1: award.requirement,
        })}
      </Text>
      {!completed && (
        <ProgressBar
          value={award.progress}
          maximum={award.requirement}
          label={tr("Progreso de {0}", { 0: tr(award.name) })}
        />
      )}
      {!completed && (
        <Body muted>
          {award.status === "revoked"
            ? tr("Este logro fue revocado.")
            : tr("Te faltan {0}", { 0: award.remaining })}
        </Body>
      )}
    </View>
  );
}

function AchievementsContent() {
  useLocale();
  const query = useGamification();
  const data = query.data;
  const groups = groupAchievements(data?.achievements ?? []);
  return (
    <QueryState query={query}>
      {data && (
        <View style={{ gap: t.spacing.section }}>
          <Card>
            <LevelProgress data={data} />
            <Body>
              {tr("{0} de {1} logros completados", {
                0: groups.completed.length,
                1: data.achievements.length,
              })}
            </Body>
          </Card>
          {data.achievements.length === 0 ? (
            <Body>{tr("Todavía no hay logros disponibles.")}</Body>
          ) : (
            <View style={{ gap: t.spacing.section }}>
              <View style={{ gap: t.spacing.md }}>
                <Text
                  accessibilityRole="header"
                  style={[styles.title, { fontSize: 24 }]}
                >
                  {tr("Completados")} · {groups.completed.length}
                </Text>
                {groups.completed.length === 0 && (
                  <Body muted>
                    {tr(
                      "Tu primera medalla te espera. Marcá una yerba como probada para empezar.",
                    )}
                  </Body>
                )}
                {groups.completed.map((award) => (
                  <AchievementCard key={award.key} award={award} />
                ))}
              </View>
              <View style={{ gap: t.spacing.md }}>
                <Text
                  accessibilityRole="header"
                  style={[styles.title, { fontSize: 24 }]}
                >
                  {tr("Pendientes")} · {groups.pending.length}
                </Text>
                {groups.pending.length === 0 && (
                  <Body muted>{tr("¡Completaste todos los logros!")}</Body>
                )}
                {groups.pending.map((award) => (
                  <AchievementCard key={award.key} award={award} />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </QueryState>
  );
}

export function Achievements() {
  return (
    <Page>
      <RequireSession>
        <AchievementsContent />
      </RequireSession>
    </Page>
  );
}
