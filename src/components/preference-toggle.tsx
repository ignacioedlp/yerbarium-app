import { Host, Switch } from "@expo/ui";
import { Pressable, Text } from "react-native";
import { theme } from "@/theme";
export function PreferenceToggle({
  label,
  value,
  disabled,
  onChange,
  testID,
}: {
  label: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
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
      <Text style={{ flex: 1, fontFamily: theme.fonts.bold, fontSize: 17 }}>
        {label}
      </Text>
      <Host
        matchContents
        colorScheme="light"
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
