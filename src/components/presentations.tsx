import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import {
  Button as NativeButton,
  Column,
  Host,
  Text as NativeText,
} from "@expo/ui";
import type {
  PresentationAvailability,
  ProductPresentation,
} from "@/api/types";
import { formatWeight, presentationMatrix } from "@/api/presentations";
import { packageTypeLabel } from "@/api/format";
import { getLocale, tr, useLocale } from "@/i18n";
import { useTheme } from "@/theme";
import { Body, ExternalLink } from "./ui";

const artwork = {
  light: {
    AVAILABLE: require("../../assets/presentations/available-light.svg"),
    UNAVAILABLE: require("../../assets/presentations/unavailable-light.svg"),
    UNKNOWN: require("../../assets/presentations/unknown-light.svg"),
  },
  dark: {
    AVAILABLE: require("../../assets/presentations/available-dark.svg"),
    UNAVAILABLE: require("../../assets/presentations/unavailable-dark.svg"),
    UNKNOWN: require("../../assets/presentations/unknown-dark.svg"),
  },
};
const states = {
  AVAILABLE: { symbol: "✓", label: "Presentación confirmada" },
  UNAVAILABLE: { symbol: "×", label: "No ofrecida según la fuente" },
  UNKNOWN: { symbol: "?", label: "Sin confirmar" },
};
function PresentationCell({ item }: { item: PresentationAvailability }) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const weight = formatWeight(item.weight_grams, getLocale());
  const state = states[item.status];
  const color = {
    AVAILABLE: theme.colors.packageAvailable,
    UNAVAILABLE: theme.colors.packageUnavailable,
    UNKNOWN: theme.colors.packageUnknown,
  }[item.status];
  const height =
    78 + Math.min(5, Math.log2(Math.max(100, item.weight_grams) / 100)) * 9;
  const textStyle = {
    color: theme.colors.muted,
    fontFamily: theme.fonts.body,
    fontSize: theme.type.caption,
    textAlign: "center" as const,
  };
  return (
    <View style={{ gap: theme.spacing.sm, alignItems: "center" }}>
      <View
        accessible
        accessibilityLabel={`${weight}: ${tr(state.label)}`}
        style={{ gap: theme.spacing.sm, alignItems: "center", width: "100%" }}
      >
        <View style={{ height: 128, justifyContent: "flex-end" }}>
          <Image
            source={artwork[theme.dark ? "dark" : "light"][item.status]}
            style={{ width: (height * 88) / 120, height }}
            contentFit="contain"
            accessible={false}
          />
        </View>
        <Text
          selectable
          style={{
            color: theme.colors.ink,
            fontFamily: theme.fonts.bold,
            fontSize: 20,
            fontVariant: ["tabular-nums"],
          }}
        >
          {weight}
        </Text>
        <Text
          style={{
            color,
            fontFamily: theme.fonts.bold,
            fontSize: 14,
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          {state.symbol} {tr(state.label)}
        </Text>
      </View>
      {(item.presentations.length > 0 || item.source?.url) && (
        <View style={{ width: "100%", alignItems: "center" }}>
          <Host
            matchContents
            colorScheme={theme.dark ? "dark" : "light"}
            style={{ minHeight: 44 }}
          >
            <Column alignment="center">
              <NativeButton
                variant="text"
                testID={`presentation-details-${item.weight_grams}`}
                onPress={() => setExpanded((value) => !value)}
              >
                <NativeText
                  style={{ paddingVertical: 12 }}
                  textStyle={{ ...textStyle, fontSize: 14, lineHeight: 20 }}
                >
                  {`${expanded ? "▾" : "▸"} ${tr(expanded ? "Ocultar detalles" : "Ver detalles")}`}
                </NativeText>
              </NativeButton>
            </Column>
          </Host>
          {expanded && (
            <View style={{ width: "100%", gap: 8, paddingVertical: 8 }}>
              {item.presentations.map((pack, index) => (
                <Text
                  selectable
                  key={`${pack.package_type}-${pack.barcode}-${index}`}
                  style={{ ...textStyle, lineHeight: 20 }}
                >{`${packageTypeLabel(pack.package_type)}${pack.barcode ? ` · EAN ${pack.barcode}` : ""}`}</Text>
              ))}
              {item.status === "UNAVAILABLE" && (
                <Text selectable style={{ ...textStyle, lineHeight: 20 }}>
                  {tr(
                    "La fuente consultada indica que este tamaño no se ofrece.",
                  )}
                </Text>
              )}
              {item.verified_at && (
                <Text selectable style={{ ...textStyle, lineHeight: 20 }}>
                  {tr("Verificado: {date}", {
                    date: new Date(
                      `${item.verified_at}T00:00:00Z`,
                    ).toLocaleDateString(getLocale(), { timeZone: "UTC" }),
                  })}
                </Text>
              )}
            </View>
          )}
          {expanded && item.status !== "AVAILABLE" && item.source?.url && (
            <ExternalLink
              label={item.source.title || tr("Ver fuente")}
              url={item.source.url}
              textLink
            />
          )}
        </View>
      )}
    </View>
  );
}
export function Presentations({
  presentations,
  availability,
}: {
  presentations: ProductPresentation[];
  availability?: PresentationAvailability[];
}) {
  const theme = useTheme();
  useLocale();
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = React.useState(0);
  const { canonical, other } = presentationMatrix(presentations, availability);
  const gap = theme.spacing.md;
  const columns = Math.max(
    1,
    Math.min(5, Math.floor((width + gap) / (140 * fontScale + gap))),
  );
  const renderGrid = (items: PresentationAvailability[]) => (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap,
        alignItems: "flex-start",
      }}
    >
      {items.map((item) => (
        <View
          key={item.weight_grams}
          style={{
            width: width ? (width - gap * (columns - 1)) / columns : "100%",
          }}
        >
          <PresentationCell item={item} />
        </View>
      ))}
    </View>
  );
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ gap: theme.spacing.lg }}
    >
      <Body muted>
        {tr(
          "Presentaciones registradas en el catálogo. No indica stock en comercios.",
        )}
      </Body>
      {renderGrid(canonical)}
      {other.length > 0 && (
        <View style={{ gap: theme.spacing.md }}>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: theme.fonts.bold,
              fontSize: 18,
              color: theme.colors.ink,
            }}
          >
            {tr("Otras presentaciones")}
          </Text>
          {renderGrid(other)}
        </View>
      )}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: theme.colors.border,
          paddingTop: theme.spacing.md,
        }}
      >
        <Body muted>
          {tr(
            "✓ Confirmada en el catálogo · × No ofrecida según la evidencia consultada · ? Sin confirmar",
          )}
        </Body>
      </View>
    </View>
  );
}
