import { tr, useLocale } from "@/i18n";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paper } from "@/components/editorial";
import { Icon } from "@/components/icon";
import { Body, ErrorMessage, OfflineBanner, Title } from "@/components/ui";
import { theme as t } from "@/theme";

export function AuthSheet({
  title,
  description,
  children,
  actions,
  pending,
  showClose = true,
}: React.PropsWithChildren<{
  title: string;
  description: string;
  actions: React.ReactNode;
  pending: boolean;
  showClose?: boolean;
}>) {
  useLocale();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ gestureEnabled: !pending }} />
      <Paper />
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.xl,
          paddingBottom: t.spacing.lg,
          gap: t.spacing.lg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: t.spacing.md,
          }}
        >
          <View style={{ flex: 1, gap: t.spacing.sm }}>
            <Title>{title}</Title>
            <Body>{description}</Body>
          </View>
          {showClose && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr("Cerrar")}
              disabled={pending}
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace("/(tabs)/perfil");
              }}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.sage,
                alignItems: "center",
                justifyContent: "center",
                opacity: pending ? 0.45 : pressed ? 0.65 : 1,
              })}
            >
              <Icon name="close" />
            </Pressable>
          )}
        </View>
        <OfflineBanner />
        <View style={{ gap: 20 }}>{children}</View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.md,
          paddingBottom: Math.max(insets.bottom, t.spacing.lg),
          gap: t.spacing.md,
          borderTopWidth: 1,
          borderColor: t.colors.subtleBorder,
          backgroundColor: t.colors.background,
        }}
      >
        {actions}
      </View>
    </KeyboardAvoidingView>
  );
}

export function AuthField({
  label,
  error,
  hint,
  inputRef,
  secureTextEntry,
  onBlur,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  inputRef?: React.Ref<TextInput>;
}) {
  useLocale();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text
        style={{ fontFamily: t.fonts.bold, fontSize: 15, color: t.colors.ink }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 56,
          backgroundColor: t.colors.cream,
          borderRadius: t.radius.control,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: error
            ? t.colors.error
            : focused
              ? t.colors.green
              : t.colors.border,
        }}
      >
        <TextInput
          {...props}
          ref={inputRef}
          accessibilityLabel={label}
          secureTextEntry={secureTextEntry && !visible}
          selectionColor={t.colors.green}
          placeholderTextColor={t.colors.muted}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={{
            flex: 1,
            minHeight: 54,
            paddingHorizontal: t.spacing.md,
            paddingVertical: 12,
            fontFamily: t.fonts.body,
            fontSize: 17,
            color: t.colors.ink,
          }}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? tr("Ocultar contraseña") : tr("Mostrar contraseña")
            }
            accessibilityState={{ selected: visible }}
            onPress={() => setVisible(!visible)}
            style={({ pressed }) => ({
              minHeight: 44,
              paddingHorizontal: t.spacing.md,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <Icon name={visible ? "eyeOff" : "eye"} size={22} />
          </Pressable>
        )}
      </View>
      {error ? (
        <ErrorMessage message={error} />
      ) : hint ? (
        <Body muted>{hint}</Body>
      ) : null}
    </View>
  );
}

export function AuthSwitch({
  register,
  pending,
}: {
  register: boolean;
  pending: boolean;
}) {
  useLocale();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: t.spacing.xs,
      }}
    >
      <Body muted>
        {register ? tr("¿Ya tenés cuenta?") : tr("¿Todavía no tenés cuenta?")}
      </Body>
      <Pressable
        accessibilityRole="button"
        disabled={pending}
        accessibilityState={{ disabled: pending }}
        onPress={() => router.replace(register ? "/ingresar" : "/registro")}
        style={({ pressed }) => ({
          minHeight: 44,
          justifyContent: "center",
          paddingHorizontal: t.spacing.sm,
          opacity: pending ? 0.45 : pressed ? 0.65 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: t.fonts.bold,
            fontSize: 15,
            color: t.colors.green,
          }}
        >
          {register ? tr("Ingresar") : tr("Crear cuenta")}
        </Text>
      </Pressable>
    </View>
  );
}
