import { tr, useLocale } from "@/i18n";
import { Stack } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { theme } from "@/theme";
export default function TabLayout() {
  useLocale();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeTabs
        tintColor={theme.colors.green}
        indicatorColor={theme.colors.selected}
        rippleColor={theme.colors.selected}
        backgroundColor={theme.colors.surface}
        labelStyle={{ fontFamily: theme.fonts.body }}
      >
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Label>{tr("Inicio")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explorar">
          <NativeTabs.Trigger.Label>{tr("Explorar")}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="biblioteca">
          <NativeTabs.Trigger.Label>
            {tr("Mi biblioteca")}
          </NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="book.fill" md="book" />
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
