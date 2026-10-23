import { tr, useLocale } from "@/i18n";
import { Stack } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTheme } from "@/theme";
export default function TabLayout() {
  const theme = useTheme();
  useLocale();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeTabs
        tintColor={theme.colors.green}
        iconColor={{
          default: theme.colors.muted,
          selected: theme.colors.green,
        }}
        indicatorColor={theme.colors.selected}
        rippleColor={theme.colors.selected}
        backgroundColor={theme.colors.surface}
        blurEffect="none"
        labelStyle={{
          default: {
            color: theme.colors.muted,
            fontFamily: theme.fonts.body,
          },
          selected: {
            color: theme.colors.green,
            fontFamily: theme.fonts.body,
          },
        }}
      >
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Label>{tr("Inicio")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explorar">
          <NativeTabs.Trigger.Label>{tr("Explorar")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="escanear">
          <NativeTabs.Trigger.Label>{tr("Escanear")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf="barcode.viewfinder"
            md="barcode_scanner"
          />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="social">
          <NativeTabs.Trigger.Label>{tr("Social")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="person.2.fill" md="groups" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="perfil">
          <NativeTabs.Trigger.Label>{tr("Perfil")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="person.crop.circle" md="person" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
