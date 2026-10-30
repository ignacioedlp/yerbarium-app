import { tr, useLocale } from "@/i18n";
import React from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/icon";
import { CountryFlag } from "@/components/country-flag";
import { ErrorMessage, Title } from "@/components/ui";
import { useTheme, useThemedStyles, type AppTheme } from "@/theme";

type Option = readonly [code: string, label: string];

// Keep the profile options aligned with the web profile form.
export const profileCountries: readonly Option[] = [
  ["AR", "Argentina"],
  ["BO", "Bolivia"],
  ["BR", "Brasil"],
  ["CL", "Chile"],
  ["PY", "Paraguay"],
  ["UY", "Uruguay"],
];
export const profileLanguages: readonly Option[] = [
  ["es", "Español"],
  ["es-AR", "Español (Argentina)"],
  ["pt", "Português"],
  ["pt-BR", "Português (Brasil)"],
  ["en", "English"],
];
const languageFlags: Record<string, readonly [string, string]> = {
  es: ["ES", "España"],
  "es-AR": ["AR", "Argentina"],
  pt: ["PT", "Portugal"],
  "pt-BR": ["BR", "Brasil"],
  en: ["GB", "Reino Unido"],
};

export function ProfileSelect({
  label,
  icon,
  value,
  options,
  onChange,
  onBlur,
  disabled,
  error,
}: {
  label: string;
  icon: IconName;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: string;
}) {
  const t = useTheme();
  const styles = useThemedStyles(createStyles);
  useLocale();
  const [open, setOpen] = React.useState(false);
  const rawLabel = options.find(([code]) => code === value)?.[1] || value;
  const selectedLabel = icon === "globe" ? tr(rawLabel) : rawLabel;
  // Preserve values already stored by accounts outside the suggested options.
  const choices: readonly Option[] = [
    ["", "Sin especificar"],
    ...(value && !options.some(([code]) => code === value)
      ? [[value, value] as const]
      : []),
    ...options,
  ];
  const close = () => {
    setOpen(false);
    onBlur();
  };
  const optionIcon = (code: string, name: string) => {
    if (
      icon === "globe" &&
      profileCountries.some(([country]) => country === code)
    ) {
      return <CountryFlag code={code} country={name} />;
    }
    const flag = icon === "language" ? languageFlags[code] : undefined;
    if (flag) return <CountryFlag code={flag[0]} country={flag[1]} />;
    return <Icon name={icon} size={22} />;
  };
  return (
    <View style={{ gap: t.spacing.xs }}>
      <Text style={styles.label}>
        {label} <Text style={styles.optional}>{tr("(opcional)")}</Text>
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel || tr("Sin especificar")}`}
        accessibilityHint={tr(
          icon === "globe"
            ? "Abre las opciones de país"
            : "Abre las opciones de idioma",
        )}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        testID={`profile-select-${icon}`}
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.trigger,
          {
            opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
            borderColor: error ? t.colors.error : t.colors.border,
          },
        ]}
      >
        {optionIcon(value, selectedLabel)}
        <Text style={[styles.value, !value && { color: t.colors.muted }]}>
          {selectedLabel ||
            tr(icon === "globe" ? "Elegí un país" : "Elegí un idioma")}
        </Text>
        <Icon name="chevronDown" size={18} />
      </Pressable>
      {error && <ErrorMessage message={error} />}
      {open && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={close}
          allowSwipeDismissal
          testID="profile-options-sheet"
        >
          <SafeAreaView
            edges={["top", "bottom"]}
            style={{ flex: 1, backgroundColor: t.colors.background }}
          >
            <View style={styles.header}>
              <View style={{ flex: 1, gap: t.spacing.xs }}>
                <Title>
                  {icon === "globe"
                    ? tr("Elegí tu país")
                    : tr("Elegí tu idioma")}
                </Title>
                <Text style={styles.description}>
                  {tr("Podés dejarlo sin especificar.")}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={tr("Cerrar opciones")}
                onPress={close}
                style={styles.close}
              >
                <Icon name="close" />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.options}>
              {choices.map(([code, name]) => (
                <Pressable
                  key={code}
                  accessibilityRole="radio"
                  accessibilityLabel={
                    code && icon === "language" ? name : tr(name)
                  }
                  accessibilityState={{ checked: code === value }}
                  onPress={() => {
                    onChange(code);
                    close();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    {
                      backgroundColor:
                        code === value
                          ? t.colors.selected
                          : pressed
                            ? t.colors.sage
                            : "transparent",
                    },
                  ]}
                >
                  {optionIcon(code, name)}
                  <Text
                    style={[
                      styles.value,
                      code === value && { fontFamily: t.fonts.bold },
                    ]}
                  >
                    {code && icon === "language" ? name : tr(name)}
                  </Text>
                  {code === value && <Icon name="check" />}
                </Pressable>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

const createStyles = (t: AppTheme) =>
  StyleSheet.create({
    label: {
      fontFamily: t.fonts.bold,
      fontSize: t.type.caption,
      color: t.colors.ink,
    },
    optional: { fontFamily: t.fonts.body, color: t.colors.muted },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.sm,
      minHeight: 56,
      padding: t.spacing.md,
      borderWidth: 1,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.cream,
    },
    value: {
      flex: 1,
      fontFamily: t.fonts.body,
      fontSize: t.type.body,
      color: t.colors.ink,
    },
    description: {
      fontFamily: t.fonts.body,
      fontSize: t.type.caption,
      color: t.colors.muted,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.sm,
      padding: t.spacing.lg,
    },
    close: {
      minHeight: 44,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    options: {
      paddingHorizontal: t.spacing.lg,
      paddingBottom: t.spacing.xl,
      gap: t.spacing.xs,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.spacing.sm,
      minHeight: 56,
      padding: t.spacing.md,
      borderRadius: t.radius.control,
    },
  });
