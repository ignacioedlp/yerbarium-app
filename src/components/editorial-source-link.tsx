import { tr, useLocale } from "@/i18n";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icon";
import { ErrorMessage, openExternal } from "@/components/ui";
import { theme } from "@/theme";

export function EditorialSourceLink({
  name,
  publisher,
  note,
  href,
}: {
  name: string;
  publisher: string;
  note: string;
  href: string;
}) {
  useLocale();
  const [error, setError] = useState(false);
  return (
    <View
      style={{ borderBottomWidth: 1, borderColor: theme.colors.subtleBorder }}
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={name}
        accessibilityHint={tr("Abre el sitio de la fuente")}
        onPress={() => {
          setError(false);
          void openExternal(href).catch(() => setError(true));
        }}
        style={({ pressed }) => ({
          paddingVertical: theme.spacing.md,
          minHeight: 44,
          gap: theme.spacing.sm,
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontFamily: theme.fonts.bold,
              fontSize: 17,
              color: theme.colors.green,
            }}
          >
            {name}
          </Text>
          <Icon name="arrow" size={18} />
        </View>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 13,
            color: theme.colors.muted,
          }}
        >
          {publisher}
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: theme.type.body,
            lineHeight: 23,
            color: theme.colors.ink,
          }}
        >
          {tr(note)}
        </Text>
      </Pressable>
      {error && (
        <ErrorMessage
          message={tr(
            "No pudimos abrir el enlace. Volvé a tocar la fuente para reintentar.",
          )}
        />
      )}
    </View>
  );
}
