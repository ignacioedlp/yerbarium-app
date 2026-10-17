import { tr, useLocale } from "@/i18n";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { Stack, router, useSegments } from "expo-router";
import { ObserveRoot, useObserve } from "expo-observe";
import { useFonts } from "expo-font";
import { NunitoSans_400Regular } from "@expo-google-fonts/nunito-sans/400Regular";
import { NunitoSans_800ExtraBold } from "@expo-google-fonts/nunito-sans/800ExtraBold";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { DataProvider } from "@/providers/data";
import { NotificationObserver } from "@/providers/notifications";
import { SessionProvider, useSession } from "@/providers/session";
import { LocaleProvider, useLocaleReady } from "@/providers/locale";
import { ComparisonProvider } from "@/providers/comparison";
import { theme } from "@/theme";
import { LaunchSplash } from "@/components/launch-splash";
import { AppHeader } from "@/components/app-header";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { posthogClient } from "@/analytics";

function AnalyticsTracking() {
  useLocale();
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
  useLocale();
  const { ready } = useSession();
  const localeReady = useLocaleReady();
  const { markInteractive } = useObserve();
  const [fonts, error] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_800ExtraBold,
    Lilita: require("../../assets/fonts/lilita-one-latin.ttf"),
    Caveat: require("../../assets/fonts/caveat-variable.ttf"),
  });

  const appReady = ready && localeReady && Boolean(fonts || error);
  const [contentLaidOut, setContentLaidOut] = useState(false);
  const [splashReady, setSplashReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  // Let the first native navigation commit and compositor frames finish
  // before competing with startup work for the UI thread.
  useEffect(() => {
    if (!appReady || !contentLaidOut) return;
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setSplashReady(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [appReady, contentLaidOut]);
  const finishSplash = useCallback(() => setSplashFinished(true), []);

  useEffect(() => {
    if (appReady && splashFinished) markInteractive();
  }, [appReady, markInteractive, splashFinished]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{ flex: 1 }}
        pointerEvents={splashFinished ? "auto" : "none"}
        accessibilityElementsHidden={!splashFinished}
        importantForAccessibility={
          splashFinished ? "auto" : "no-hide-descendants"
        }
      >
        {appReady && (
          <View style={{ flex: 1 }} onLayout={() => setContentLaidOut(true)}>
            <NotificationObserver />
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
                    rightAction={options.headerRight?.({
                      tintColor: theme.colors.green,
                      canGoBack: Boolean(back),
                    })}
                  />
                ),
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            >
              <Stack.Screen
                name="ajustes/notificaciones"
                options={{ title: tr("Notificaciones"), headerShown: true }}
              />
              <Stack.Screen
                name="resenas/[id]"
                options={{ title: tr("Reseña"), headerShown: true }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="yerbas/[slug]"
                options={{ title: tr("Yerba"), headerShown: true }}
              />
              <Stack.Screen
                name="marcas/[slug]"
                options={{ title: tr("Marca"), headerShown: true }}
              />
              <Stack.Screen
                name="usuarios/[username]"
                options={{ title: tr("Perfil"), headerShown: true }}
              />
              <Stack.Screen
                name="comparar"
                options={{ title: tr("Comparar"), headerShown: true }}
              />
              <Stack.Screen
                name="ingresar"
                options={{
                  title: tr("Ingresar"),
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
                  title: tr("Crear cuenta"),
                  presentation: "formSheet",
                  headerShown: false,
                  sheetAllowedDetents:
                    Platform.OS === "android" ? [0.92, 1] : [0.8, 1],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 32,
                }}
              />
              <Stack.Screen
                name="recuperar-contrasena"
                options={{ title: tr("Recuperar cuenta"), headerShown: true }}
              />
              <Stack.Screen
                name="restablecer-contrasena"
                options={{ title: tr("Nueva contraseña"), headerShown: true }}
              />
              <Stack.Screen
                name="verificar-email"
                options={{ title: tr("Verificar email"), headerShown: true }}
              />
              <Stack.Screen
                name="ajustes/index"
                options={{ title: tr("Ajustes"), headerShown: true }}
              />
              <Stack.Screen
                name="ajustes/idioma"
                options={{ title: tr("Idioma"), headerShown: true }}
              />
              <Stack.Screen
                name="usuarios/[username]/seguidores"
                options={{ title: tr("Seguidores"), headerShown: true }}
              />
              <Stack.Screen
                name="usuarios/[username]/seguidos"
                options={{ title: tr("Seguidos"), headerShown: true }}
              />
              <Stack.Screen
                name="editar-perfil"
                options={{ title: tr("Editar perfil"), headerShown: true }}
              />
              <Stack.Screen
                name="eliminar-cuenta"
                options={{ title: tr("Eliminar cuenta"), headerShown: true }}
              />
              <Stack.Screen
                name="opinion/[slug]"
                options={{ title: tr("Tu opinión"), headerShown: true }}
              />
              <Stack.Screen
                name="editorial/[article]"
                options={{ title: "", headerShown: true }}
              />
            </Stack>
          </View>
        )}
      </View>
      {!splashFinished && (
        <LaunchSplash ready={splashReady} onFinish={finishSplash} />
      )}
    </View>
  );
}
function RootLayout() {
  useLocale();
  const app = (
    <SafeAreaProvider>
      <DataProvider>
        <SessionProvider>
          <LocaleProvider>
            <ComparisonProvider>
              <Navigation />
            </ComparisonProvider>
          </LocaleProvider>
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

export default ObserveRoot.wrap(RootLayout);
