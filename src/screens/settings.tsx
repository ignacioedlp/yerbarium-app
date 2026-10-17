import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Page, Body, Button, ErrorMessage } from "@/components/ui";
import { Icon } from "@/components/icon";
import { CountryFlag } from "@/components/country-flag";
import { profileLanguages } from "@/components/profile-select";
import { useLanguageSettings } from "@/providers/locale";
import { tr, useLocale } from "@/i18n";
import { theme } from "@/theme";
import type { AppLanguage } from "@/i18n/core";
const flags: Record<AppLanguage, readonly [string, string]> = {
  es: ["ES", "España"],
  "es-AR": ["AR", "Argentina"],
  pt: ["PT", "Portugal"],
  "pt-BR": ["BR", "Brasil"],
  en: ["GB", "Reino Unido"],
};
const textStyle = {
  fontFamily: theme.fonts.body,
  fontSize: 17,
  color: theme.colors.ink,
};
const supportingStyle = {
  fontFamily: theme.fonts.body,
  fontSize: theme.type.caption,
  color: theme.colors.muted,
};
function SettingsRow({
  selected = false,
  children,
  supportingText,
  leading,
  trailing,
  onPress,
  testID,
}: React.PropsWithChildren<{
  selected?: boolean;
  supportingText?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress: () => void;
  testID?: string;
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {leading}
      <View style={styles.rowCopy}>
        <Text style={[textStyle, selected && styles.selectedText]}>{children}</Text>
        {supportingText ? (
          <Text style={supportingStyle}>{supportingText}</Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}
export function Settings() {
  useLocale();
  const { language } = useLanguageSettings();
  const name = profileLanguages.find(([code]) => code === language)![1];
  return (
    <Page>
      <View style={styles.list}>
        <SettingsRow
          testID="settings-language"
          leading={<Icon name="language" size={24} />}
          trailing={<Icon name="arrow" size={18} />}
          supportingText={name}
          onPress={() => router.push("/ajustes/idioma")}
        >
          {tr("Idioma")}
        </SettingsRow>
      </View>
    </Page>
  );
}
export function LanguageSettings() {
  useLocale();
  const { language, pending, error, chooseLanguage, retry } =
    useLanguageSettings();
  return (
    <Page>
      <Body>
        {tr("Elegí el idioma que querés usar. No necesitás iniciar sesión.")}
      </Body>
      <View style={styles.list}>
        {profileLanguages.map(([code, name]) => (
          <SettingsRow
            key={code}
            selected={code === language}
            testID={`language-${code}`}
            leading={
              <CountryFlag
                code={flags[code as AppLanguage][0]}
                country={flags[code as AppLanguage][1]}
              />
            }
            trailing={code === language ? <Icon name="check" /> : undefined}
            supportingText={code === language ? tr("Seleccionado") : undefined}
            onPress={() => {
              if (!pending) chooseLanguage(code as AppLanguage);
            }}
          >
            {name}
          </SettingsRow>
        ))}
      </View>
      {pending && <Body muted>{tr("Guardando…")}</Body>}
      {error && (
        <>
          <ErrorMessage message={tr(error)} />
          <Button
            label={tr("Reintentar")}
            secondary
            disabled={pending}
            onPress={retry}
          />
        </>
      )}
    </Page>
  );
}
const styles = StyleSheet.create({
  list: {
    borderTopWidth: 1,
    borderColor: theme.colors.subtleBorder,
  },
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: theme.colors.subtleBorder,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  selectedText: {
    color: theme.colors.green,
    fontFamily: theme.fonts.bold,
  },
});
