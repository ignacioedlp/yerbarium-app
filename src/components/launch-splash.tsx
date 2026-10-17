import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

// Keep the native image until its identical React layer has been painted.
void SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ fade: false });

const LOGO_SIZE = 180;
const SPLASH_BACKGROUND = "#f4f0e4";
const GROWTH_CURVE = Easing.bezier(0.4, 0, 0.2, 1);
const EXIT_DURATION = 1100;

export function LaunchSplash({
  ready,
  onFinish,
}: {
  ready: boolean;
  onFinish: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [laidOut, setLaidOut] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [nativeHidden, setNativeHidden] = useState(false);
  const progress = useSharedValue(0);
  // The transparent logo occupies 74% of its canvas. Oversize it beyond
  // both edges even on tablets and in landscape before revealing the app.
  const finalScale = (Math.max(width, height) / (LOGO_SIZE * 0.74)) * 1.4;

  useEffect(() => {
    if (!laidOut || !imageReady) return;
    let active = true;
    void SplashScreen.hideAsync().then(() => {
      if (active) setNativeHidden(true);
    });
    return () => {
      active = false;
    };
  }, [imageReady, laidOut]);

  useEffect(() => {
    if (!ready || !nativeHidden) return;
    const finish = (finished?: boolean) => {
      "worklet";
      if (finished) scheduleOnRN(onFinish);
    };
    progress.set(
      withTiming(
        1,
        {
          duration: reducedMotion ? 120 : EXIT_DURATION,
          easing: reducedMotion ? Easing.linear : GROWTH_CURVE,
          reduceMotion: ReduceMotion.Never,
        },
        finish,
      ),
    );
    return () => cancelAnimation(progress);
  }, [nativeHidden, onFinish, progress, ready, reducedMotion]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion
      ? 1 - progress.get()
      : interpolate(progress.get(), [0, 0.84, 1], [1, 1, 0]),
  }));
  const logoStyle = useAnimatedStyle(() => {
    const phase = progress.get();
    // Three gentle surges, with continuous positive velocity between them.
    // Logarithmic scaling keeps perceived zoom speed proportional to size;
    // separate ease-out animations stopped and jumped at each boundary.
    const growth =
      phase + (0.28 * Math.sin(6 * Math.PI * phase)) / (6 * Math.PI);
    return {
      transform: [
        { scale: reducedMotion ? 1 : Math.exp(Math.log(finalScale) * growth) },
      ],
    };
  });

  return (
    <Animated.View
      testID="launch-splash"
      onLayout={() => setLaidOut(true)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[s.overlay, overlayStyle]}
    >
      <Animated.Image
        source={require("../../assets/branding/splash-logo.png")}
        onLoad={() => setImageReady(true)}
        fadeDuration={0}
        resizeMode="contain"
        style={[s.logo, logoStyle]}
      />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
});
