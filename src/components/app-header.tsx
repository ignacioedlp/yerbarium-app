import { tr, useLocale } from "@/i18n";
import { Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/icon";
import { Paper } from "@/components/editorial";
import { useTheme } from "@/theme";

export function AppHeader({
  title,
  onBack,
  paper = false,
  rightAction,
}: {
  title: string;
  onBack: () => void;
  paper?: boolean;
  rightAction?: ReactNode;
}) {
  const theme = useTheme();
  useLocale();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: paper ? theme.colors.background : theme.colors.hero,
        isolation: "isolate",
        paddingTop: insets.top,
        paddingLeft: Math.max(insets.left, theme.spacing.md),
        paddingRight: Math.max(insets.right, theme.spacing.md),
      }}
    >
      <Paper dark={!paper} />
      <View
        style={{
          minHeight: 56,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Volver")}
          onPress={onBack}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 44,
            flexShrink: 0,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: paper ? theme.colors.hero : theme.colors.cream,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Icon
            name="arrowLeft"
            size={22}
            color={paper ? theme.colors.onDark : theme.colors.green}
          />
        </Pressable>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={{
            flex: 1,
            textAlign: "center",
            color: paper ? theme.colors.ink : theme.colors.onDark,
            fontFamily: theme.fonts.bold,
            fontSize: 18,
          }}
        >
          {title}
        </Text>
        <View
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rightAction}
        </View>
      </View>
    </View>
  );
}
