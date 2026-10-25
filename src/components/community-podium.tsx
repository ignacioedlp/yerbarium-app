import { tr, useLocale } from "@/i18n";
import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { CommunityRanking, RankedYerba } from "@/api/types";
import { useResource } from "@/hooks/queries";
import { useTheme, useThemedStyles, type AppTheme } from "@/theme";
import { SectionHeading } from "./editorial";
import { QueryState, useUIStyles } from "./ui";

export function CommunityPodium() {
  const t = useTheme();
  const styles = useUIStyles();
  useLocale();
  const ranking = useResource<CommunityRanking>(
    "community/rankings/yerbas/?limit=3",
  );
  const { width, fontScale } = useWindowDimensions();
  const stacked = width < 350 || fontScale > 1.3;
  const yerbas = ranking.data?.results.slice(0, 3) ?? [];
  const podiumYerbas =
    !stacked && yerbas.length === 3
      ? [yerbas[1], yerbas[0], yerbas[2]]
      : yerbas;

  return (
    <View style={{ gap: t.spacing.md }} testID="community-podium">
      <View style={{ gap: t.spacing.sm }}>
        <SectionHeading
          title={tr("Mejor valoradas por la comunidad")}
          compact
        />
        <Text style={styles.muted}>
          {tr("El podio combina puntuación y cantidad de opiniones.")}
        </Text>
      </View>
      <QueryState query={ranking}>
        {yerbas.length ? (
          <View
            style={{
              flexDirection: stacked ? "column" : "row",
              alignItems: "stretch",
              gap: t.spacing.sm,
            }}
          >
            {podiumYerbas.map((yerba) => (
              <PodiumYerba key={yerba.slug} yerba={yerba} stacked={stacked} />
            ))}
          </View>
        ) : (
          <Text style={styles.body}>
            {tr(
              "Todavía no hay yerbas valoradas por la comunidad. Compartí tu opinión desde la ficha de una yerba.",
            )}
          </Text>
        )}
      </QueryState>
    </View>
  );
}

function PodiumYerba({
  yerba,
  stacked,
}: {
  yerba: RankedYerba;
  stacked: boolean;
}) {
  const t = useTheme();
  const podium = useThemedStyles(createPodium);
  const styles = useUIStyles();
  useLocale();
  const [failedUrl, setFailedUrl] = React.useState<string>();
  const winner = yerba.rank === 1;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tr("Puesto {0}: {1} {2}", {
        0: yerba.rank,
        1: yerba.brand.name,
        2: yerba.name,
      })}
      accessibilityHint={tr("Abrir ficha de la yerba")}
      onPress={() =>
        router.push({
          pathname: "/yerbas/[slug]",
          params: { slug: yerba.slug },
        })
      }
      style={({ pressed }) => [
        podium.item,
        {
          flex: stacked ? undefined : winner ? 1.25 : 1,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          podium.content,
          stacked && { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <View
          style={[
            podium.media,
            { height: stacked ? 152 : 188, width: stacked ? 120 : "100%" },
          ]}
        >
          {yerba.image && failedUrl !== yerba.image.url ? (
            <Image
              source={yerba.image.url}
              contentFit="contain"
              contentPosition="bottom"
              transition={180}
              accessible={false}
              style={{
                width: "100%",
                height: stacked
                  ? 152
                  : winner
                    ? 180
                    : yerba.rank === 2
                      ? 140
                      : 112,
              }}
              onError={() => setFailedUrl(yerba.image?.url)}
            />
          ) : (
            <Text style={[styles.muted, { textAlign: "center" }]}>
              {tr("Imagen no disponible")}
            </Text>
          )}
        </View>
        <View style={[podium.copy, { flex: 1 }]}>
          <Text
            style={[styles.muted, { textAlign: stacked ? "left" : "center" }]}
          >
            {yerba.brand.name}
          </Text>
          <Text
            style={[podium.name, { textAlign: stacked ? "left" : "center" }]}
          >
            {yerba.name}
          </Text>
        </View>
      </View>
      <View
        style={[
          podium.place,
          {
            minHeight: stacked ? 40 : winner ? 56 : yerba.rank === 2 ? 40 : 32,
            backgroundColor:
              yerba.rank === 1
                ? t.colors.podiumGold
                : yerba.rank === 2
                  ? t.colors.podiumSilver
                  : t.colors.podiumBronze,
            borderTopLeftRadius: t.radius.control,
            borderTopRightRadius: t.radius.control,
            marginTop: t.spacing.sm,
          },
        ]}
      >
        <Text style={[podium.position, { color: t.colors.white }]}>
          {yerba.rank}º
        </Text>
      </View>
    </Pressable>
  );
}

const createPodium = (t: AppTheme) =>
  StyleSheet.create({
    item: {
      minWidth: 0,
      justifyContent: "space-between",
    },
    content: { gap: t.spacing.sm, flex: 1 },
    media: { alignItems: "center", justifyContent: "flex-end" },
    copy: { gap: t.spacing.xs },
    name: {
      fontFamily: t.fonts.display,
      fontSize: 18,
      lineHeight: 21,
      color: t.colors.ink,
    },
    place: {
      alignItems: "center",
      justifyContent: "center",
      padding: t.spacing.xs,
    },
    position: { fontFamily: t.fonts.display, fontSize: 24 },
  });
