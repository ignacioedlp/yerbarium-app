import { tr, useLocale } from "@/i18n";
import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { theme } from "@/theme";
import { Body } from "./ui";
export function CatalogImage({
  url,
  label,
  height = 260,
}: {
  url: string;
  label: string;
  height?: number;
}) {
  useLocale();
  const [failed, setFailed] = useState(false);
  return failed ? (
    <View
      accessibilityRole="image"
      accessibilityLabel={tr("Imagen de producto no disponible")}
      style={{
        height,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.sage,
      }}
    >
      <Body muted>{tr("Imagen no disponible")}</Body>
    </View>
  ) : (
    <Image
      source={url}
      accessibilityLabel={label}
      contentFit="contain"
      style={{ height }}
      onError={() => setFailed(true)}
    />
  );
}
