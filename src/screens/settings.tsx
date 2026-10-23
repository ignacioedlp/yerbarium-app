import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import {
  Page,
  Body,
  Button,
  ErrorMessage,
  openExternal,
} from "@/components/ui";
import { Icon } from "@/components/icon";
import { CountryFlag } from "@/components/country-flag";
import { profileLanguages } from "@/components/profile-select";
import { useLanguageSettings } from "@/providers/locale";
import { tr, useLocale } from "@/i18n";
import { useTheme, useThemedStyles, type AppTheme } from "@/theme";
import type { AppLanguage } from "@/i18n/core";
import { useAppearance } from "@/providers/appearance";
import type { AppearancePreference } from "@/preferences/appearance";
import { useSession } from "@/providers/session";
const termsUrl = "https://yerbarium.vercel.app/terminos-y-condiciones/";
const privacyUrl = "https://yerbarium.vercel.app/privacidad/";
const supportUrl = "mailto:support@yerbarium.com";
const flags: Record<AppLanguage, readonly [string, string]> = {
  es: ["ES", "España"],
  "es-AR": ["AR", "Argentina"],
  pt: ["PT", "Portugal"],
  "pt-BR": ["BR", "Brasil"],
  en: ["GB", "Reino Unido"],
};
const createTextStyle = (theme: AppTheme) => ({
  fontFamily: theme.fonts.body,
  fontSize: 17,
  color: theme.colors.ink,
});
const createSupportingStyle = (theme: AppTheme) => ({
  fontFamily: theme.fonts.body,
  fontSize: theme.type.caption,
  color: theme.colors.muted,
});
function SettingsRow({
  selected = false,
  children,
  supportingText,
  leading,
  trailing,
  onPress,
  testID,
  destructive = false,
}: React.PropsWithChildren<{
  selected?: boolean;
  supportingText?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress: () => void;
  testID?: string;
  destructive?: boolean;
}>) {
  const textStyle = useThemedStyles(createTextStyle);
  const supportingStyle = useThemedStyles(createSupportingStyle);
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : undefined}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
    >
      {leading}
      <View style={styles.rowCopy}>
        <Text
          style={[
            textStyle,
            selected && styles.selectedText,
            destructive && styles.destructiveText,
          ]}
        >
          {children}
        </Text>
        {supportingText ? (
          <Text selectable style={supportingStyle}>
            {supportingText}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}
export function Settings() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  useLocale();
  const { language } = useLanguageSettings();
  const session = useSession();
  const appearance = useAppearance();
  const [linkError, setLinkError] = React.useState(false);
  const [supportUnavailable, setSupportUnavailable] = React.useState(false);
  const name = profileLanguages.find(([code]) => code === language)![1];
  const openLink = (url: string) => {
    setLinkError(false);
    if (url.startsWith("mailto:")) setSupportUnavailable(false);
    const open = url.startsWith("mailto:")
      ? Linking.openURL(url)
      : openExternal(url);
    void open.catch(() => {
      if (url.startsWith("mailto:")) setSupportUnavailable(true);
      else setLinkError(true);
    });
  };
  return (
    <Page>
      <View style={styles.list}>
        {session.user && (
          <SettingsRow
            testID="settings-notifications"
            leading={<Icon name="mail" size={24} />}
            trailing={<Icon name="arrow" size={18} />}
            onPress={() => router.push("/ajustes/notificaciones")}
          >
            {tr("Notificaciones")}
          </SettingsRow>
        )}
        <SettingsRow
          testID="settings-appearance"
          leading={<Icon name="appearance" size={24} />}
          trailing={<Icon name="arrow" size={18} />}
          supportingText={tr(appearanceLabels[appearance.preference])}
          onPress={() => router.push("/ajustes/apariencia")}
        >
          {tr("Apariencia")}
        </SettingsRow>
        <SettingsRow
          testID="settings-language"
          leading={<Icon name="language" size={24} />}
          trailing={<Icon name="arrow" size={18} />}
          supportingText={name}
          onPress={() => router.push("/ajustes/idioma")}
        >
          {tr("Idioma")}
        </SettingsRow>
        <SettingsRow
          testID="settings-terms"
          leading={<Icon name="book" size={24} />}
          trailing={<Icon name="external" size={18} />}
          onPress={() => openLink(termsUrl)}
        >
          {tr("Términos y Condiciones")}
        </SettingsRow>
        <SettingsRow
          testID="settings-privacy"
          leading={<Icon name="book" size={24} />}
          trailing={<Icon name="external" size={18} />}
          onPress={() => openLink(privacyUrl)}
        >
          {tr("Política de privacidad")}
        </SettingsRow>
        <SettingsRow
          testID="settings-support"
          leading={<Icon name="mail" size={24} />}
          trailing={<Icon name="arrow" size={18} />}
          supportingText="support@yerbarium.com"
          onPress={() => openLink(supportUrl)}
        >
          {tr("Soporte")}
        </SettingsRow>
      </View>
      {linkError ? (
        <ErrorMessage message={tr("No pudimos abrir el enlace.")} />
      ) : null}
      {supportUnavailable ? (
        <Body>
          {tr(
            "No encontramos una app de correo. Mantené presionada la dirección para copiarla.",
          )}
        </Body>
      ) : null}
      {session.user ? (
        <View style={styles.accountSection}>
          <Body muted>{tr("Zona de cuenta")}</Body>
          <View style={styles.list}>
            <SettingsRow
              testID="settings-delete-account"
              destructive
              leading={
                <Icon name="close" size={24} color={theme.colors.error} />
              }
              trailing={
                <Icon name="arrow" size={18} color={theme.colors.error} />
              }
              onPress={() => router.push("/eliminar-cuenta" as Href)}
            >
              {tr("Eliminar cuenta")}
            </SettingsRow>
          </View>
        </View>
      ) : null}
    </Page>
  );
}
export function LanguageSettings() {
  const styles = useThemedStyles(createStyles);
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
const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    list: {
      borderTopWidth: 1,
      borderColor: theme.colors.subtleBorder,
    },
    accountSection: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
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
    destructiveText: {
      color: theme.colors.error,
    },
  });

const appearanceLabels: Record<AppearancePreference, string> = {
  system: "Automático",
  light: "Claro",
  dark: "Oscuro",
};
export function AppearanceSettings() {
  useLocale();
  const { preference, pending, error, chooseAppearance } = useAppearance();
  return (
    <Page>
      <Body>{tr("Elegí cómo querés ver Yerbarium.")}</Body>
      <View>
        {(["system", "light", "dark"] as const).map((mode) => (
          <SettingsRow
            key={mode}
            testID={`appearance-${mode}`}
            selected={preference === mode}
            leading={
              <Icon
                name={
                  mode === "dark"
                    ? "moon"
                    : mode === "light"
                      ? "sun"
                      : "appearance"
                }
                size={24}
              />
            }
            trailing={preference === mode ? <Icon name="check" /> : undefined}
            supportingText={
              mode === "system"
                ? tr("Sigue la apariencia de tu dispositivo.")
                : undefined
            }
            onPress={() => {
              if (!pending) chooseAppearance(mode);
            }}
          >
            {tr(appearanceLabels[mode])}
          </SettingsRow>
        ))}
      </View>
      {error && (
        <>
          <ErrorMessage
            message={tr(
              "No pudimos guardar la apariencia en este dispositivo.",
            )}
          />
          <Button
            label={tr("Reintentar")}
            secondary
            disabled={pending}
            onPress={() => chooseAppearance(preference)}
          />
        </>
      )}
    </Page>
  );
}
