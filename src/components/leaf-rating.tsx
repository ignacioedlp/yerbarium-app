import { tr, useLocale, getLocale } from "@/i18n";
import { Image } from "expo-image";
import { Platform, Pressable, Text, View } from "react-native";
import { theme } from "@/theme";
import { Icon } from "@/components/icon";

// The same leaf silhouette and fractional fill used by the web sensory profile.
const leafPath =
  "M16.8 2.4C8.2 2.4 3.8 6.6 3.8 11.6a5.9 5.9 0 0 0 5.9 5.9c5.1 0 7.7-6.2 7.1-15.1Z";
function leafSource(fill: number) {
  const filled =
    fill > 0
      ? `<defs><clipPath id="fill"><rect width="${20 * fill}" height="20"/></clipPath></defs><path d="${leafPath}" fill="${theme.colors.leafFill}" clip-path="url(#fill)"/>`
      : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="${leafPath}" fill="${theme.colors.styleBackground}"/>${filled}<path d="m3.4 18 10.8-12" stroke="${theme.colors.background}" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  return { uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` };
}

export function LeafRating({
  value,
  label = "Puntuación",
  size = 20,
  showValue = true,
  onChange,
  disabled = false,
  fullWidth = false,
}: {
  value: number | string | null;
  label?: string;
  size?: number;
  showValue?: boolean;
  onChange?: (value: number) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  useLocale();
  const parsed = value === null ? null : Number(value);
  const rating =
    parsed !== null && Number.isFinite(parsed)
      ? Math.max(0, Math.min(5, parsed))
      : null;
  const formatted = rating?.toLocaleString(getLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return (
    <View
      accessible={!onChange}
      accessibilityRole={onChange ? undefined : "image"}
      accessibilityLabel={`${tr(label)}: ${rating === null ? tr("sin evaluación") : tr("{0} de 5", { 0: formatted })}`}
      style={{
        width: fullWidth ? "100%" : undefined,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        flexWrap: onChange ? "wrap" : "nowrap",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 2,
          flex: fullWidth ? 1 : undefined,
          justifyContent: fullWidth ? "space-between" : undefined,
        }}
      >
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, (rating ?? 0) - index));
          const leaf =
            Platform.OS === "android" ? (
              <View style={{ width: size, height: size }}>
                <Icon
                  name="leaf"
                  size={size}
                  color={theme.colors.styleBackground}
                />
                {fill > 0 && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: size * fill,
                      height: size,
                      overflow: "hidden",
                    }}
                  >
                    <View style={{ width: size, height: size }}>
                      <Icon
                        name="leaf"
                        size={size}
                        color={theme.colors.leafFill}
                      />
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <Image
                source={leafSource(fill)}
                accessible={false}
                contentFit="contain"
                style={{ width: size, height: size }}
              />
            );
          return onChange ? (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={tr("{0}: seleccionar {1} de 5", {
                0: tr(label),
                1: index + 1,
              })}
              accessibilityState={{ selected: rating === index + 1, disabled }}
              disabled={disabled}
              onPress={() => onChange(index + 1)}
              style={({ pressed }) => ({
                minWidth: 44,
                minHeight: 44,
                justifyContent: "center",
                alignItems: "center",
                opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
              })}
            >
              {leaf}
            </Pressable>
          ) : (
            <View key={index}>{leaf}</View>
          );
        })}
      </View>
      {showValue && rating !== null && (
        <Text
          style={{
            color: theme.colors.ink,
            fontFamily: theme.fonts.bold,
            fontSize: 14,
            fontVariant: ["tabular-nums"],
            minWidth: 52,
            textAlign: "right",
          }}
        >
          {formatted} / 5
        </Text>
      )}
    </View>
  );
}
