import React from "react";
import { Platform } from "react-native";
import { Stack, router } from "expo-router";
import { useFonts } from "expo-font";
import { NunitoSans_400Regular } from "@expo-google-fonts/nunito-sans/400Regular";
import { NunitoSans_800ExtraBold } from "@expo-google-fonts/nunito-sans/800ExtraBold";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DataProvider } from "@/providers/data";
import { SessionProvider, useSession } from "@/providers/session";
import { ComparisonProvider } from "@/providers/comparison";
import { theme } from "@/theme";
import { AppHeader } from "@/components/app-header";
function Navigation() {
  const { ready } = useSession();
  const [fonts, error] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_800ExtraBold,
    Lilita: require("../../assets/fonts/lilita-one-latin.ttf"),
    Caveat: require("../../assets/fonts/caveat-variable.ttf"),
  });

  if (!ready || (!fonts && !error))
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator accessibilityLabel="Preparando Yerbarium" />
      </View>
    );
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          headerShadowVisible: false,
          header: ({ navigation, options, back }) => (
            <AppHeader
              title={options.title ?? ""}
              paper={true}
              onBack={() => {
                if (back && navigation.canGoBack()) navigation.goBack();
                else router.replace("/(tabs)/explorar");
              }}
            />
          ),
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="yerbas/[slug]"
          options={{ title: "Yerba", headerShown: true }}
        />
        <Stack.Screen
          name="marcas/[slug]"
          options={{ title: "Marca", headerShown: true }}
        />
        <Stack.Screen
          name="usuarios/[username]"
          options={{ title: "Perfil", headerShown: true }}
        />
        <Stack.Screen
          name="comparar"
          options={{ title: "Comparar", headerShown: true }}
        />
        <Stack.Screen
          name="ingresar"
          options={{
            title: "Ingresar",
            presentation: "formSheet",
            headerShown: false,
            sheetAllowedDetents:
              Platform.OS === "android" ? [0.92, 1] : [0.68, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 32,
          }}
        />
        <Stack.Screen
          name="registro"
          options={{
            title: "Crear cuenta",
            presentation: "formSheet",
            headerShown: false,
            sheetAllowedDetents:
              Platform.OS === "android" ? [0.92, 1] : [0.8, 1],
            sheetGrabberVisible: true,
            sheetCornerRadius: 32,
          }}
        />
        <Stack.Screen
          name="editar-perfil"
          options={{ title: "Editar perfil", headerShown: true }}
        />
        <Stack.Screen
          name="opinion/[slug]"
          options={{ title: "Tu opinión", headerShown: true }}
        />
        <Stack.Screen
          name="editorial/[article]"
          options={{ title: "", headerShown: true }}
        />
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <SessionProvider>
          <ComparisonProvider>
            <Navigation />
          </ComparisonProvider>
        </SessionProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}
