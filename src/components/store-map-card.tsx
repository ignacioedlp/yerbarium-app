import { Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icon";
import { StoreLogo } from "@/components/nearby-stores";
import { getLocale, tr, useLocale } from "@/i18n";
import { useTheme } from "@/theme";
import type { StoreBranch } from "@/stores/catalog";

export function StoreMapCard({
  branch,
  onDirections,
}: {
  branch: StoreBranch;
  onDirections: () => void;
}) {
  useLocale();
  const t = useTheme();
  const distance = new Intl.NumberFormat(getLocale(), {
    maximumFractionDigits: 1,
  }).format(branch.distance_km);
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <StoreLogo branch={branch} size={52} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            selectable
            accessibilityRole="header"
            style={{
              fontFamily: t.fonts.display,
              fontSize: 24,
              lineHeight: 28,
              color: t.colors.ink,
            }}
          >
            {branch.store.name}
          </Text>
          {branch.name.toLocaleLowerCase() !==
            branch.store.name.toLocaleLowerCase() && (
            <Text
              selectable
              style={{
                fontFamily: t.fonts.bold,
                fontSize: 13,
                lineHeight: 18,
                color: t.colors.muted,
              }}
            >
              {branch.name}
            </Text>
          )}
          <Text
            selectable
            style={{
              fontFamily: t.fonts.body,
              fontSize: 14,
              lineHeight: 20,
              color: t.colors.muted,
            }}
          >
            {[branch.address, branch.city, branch.province]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderColor: t.colors.subtleBorder,
        }}
      >
        <Text
          selectable
          style={{
            fontFamily: t.fonts.body,
            fontSize: 13,
            lineHeight: 18,
            color: t.colors.muted,
            flexShrink: 1,
          }}
        >
          {tr("{0} km · en línea recta", { 0: distance })}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Cómo llegar")}
          onPress={onDirections}
          style={({ pressed }) => ({
            minHeight: 44,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: t.radius.pill,
            backgroundColor: t.colors.action,
            opacity: pressed ? 0.75 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: t.fonts.bold,
              fontSize: 14,
              lineHeight: 20,
              color: t.colors.onAction,
            }}
          >
            {tr("Cómo llegar")}
          </Text>
          <Icon name="arrow" size={18} color={t.colors.onAction} />
        </Pressable>
      </View>
    </View>
  );
}
