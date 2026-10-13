import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Stack, router, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import { NunitoSans_400Regular } from "@expo-google-fonts/nunito-sans/400Regular";
import { NunitoSans_800ExtraBold } from "@expo-google-fonts/nunito-sans/800ExtraBold";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DataProvider } from "@/providers/data";
import { SessionProvider, useSession } from "@/providers/session";
import { ComparisonProvider } from "@/providers/comparison";
import { theme } from "@/theme";
import { AppHeader } from "@/components/app-header";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { posthogClient } from "@/analytics";

function AnalyticsTracking() {
  const posthog = usePostHog();
  const segments = useSegments();
  const screenName = segments.join("/");
  const { user, ready } = useSession();
  const identifiedUser = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const userId = user?.id == null ? null : String(user.id);
    if (userId && identifiedUser.current !== userId) {
      if (identifiedUser.current) posthog.reset();
      posthog.identify(userId);
      identifiedUser.current = userId;
    } else if (!userId && identifiedUser.current) {
      posthog.reset();
      identifiedUser.current = null;
    }
  }, [posthog, ready, user?.id]);

  useEffect(() => {
    if (!screenName) return;
    posthog.capture("$screen", { $screen_name: screenName });
  }, [screenName, posthog]);

  return null;
}

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
      {posthogClient && <AnalyticsTracking />}
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
  const app = (
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
  if (!posthogClient) return app;
  return (
    <PostHogProvider
      client={posthogClient}
      autocapture={{ captureScreens: false, captureTouches: false }}
    >
      {app}
    </PostHogProvider>
  );
}
