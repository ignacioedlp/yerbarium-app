import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { tr, useLocale } from "@/i18n";
import { theme } from "@/theme";
import type { SocialProvider } from "@/api/social-auth";

export function SocialProviderButton({
  provider,
  disabled,
  onPress,
}: {
  provider: SocialProvider;
  disabled: boolean;
  onPress: () => void;
}) {
  useLocale();
  const [fontsLoaded] = useFonts({
    GoogleSans: require("../../assets/fonts/google-sans-variable.ttf"),
  });
  const label =
    provider === "google"
      ? tr("Continuar con Google")
      : tr("Continuar con Apple");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: "100%",
        minHeight: 52,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: 14,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        borderColor: "#747775",
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 22,
            height: 22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {provider === "google" ? (
            <Image
              source={require("../../assets/branding/google-g.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
              accessible={false}
            />
          ) : (
            <FontAwesome
              name="apple"
              size={22}
              color="#1f1f1f"
              accessible={false}
            />
          )}
        </View>
        <Text
          style={{
            fontFamily: fontsLoaded ? "GoogleSans" : undefined,
            fontWeight: "500",
            fontSize: 16,
            lineHeight: 22,
            color: "#1f1f1f",
            flexShrink: 1,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
