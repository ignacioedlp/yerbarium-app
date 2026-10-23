import { Host, Switch } from "@expo/ui";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme";
export function PreferenceToggle({
  label,
  description,
  value,
  disabled,
  onChange,
  testID,
}: {
  label: string;
  description?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  testID?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={() => onChange(!value)}
      testID={testID}
      style={{
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text
          style={{
            fontFamily: theme.fonts.bold,
            fontSize: 17,
            color: theme.colors.ink,
          }}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.type.body,
              lineHeight: 22,
              color: theme.colors.muted,
            }}
          >
            {description}
          </Text>
        )}
      </View>
      <Host
        matchContents
        colorScheme={theme.dark ? "dark" : "light"}
        seedColor={theme.colors.green}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Switch value={value} disabled={disabled} onValueChange={onChange} />
      </Host>
    </Pressable>
  );
}
