import { tr, useLocale } from "@/i18n";
import React from "react";
import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { Image } from "expo-image";
import { useTheme, useThemedStyles, type AppTheme } from "@/theme";
import { Icon } from "./icon";
export function Paper({ dark = false }: { dark?: boolean }) {
  const t = useTheme();
  dark = dark || t.dark;
  useLocale();
  return (
    <View
      collapsable={false}
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { mixBlendMode: dark ? "soft-light" : "normal" },
      ]}
    >
      <Image
        source={require("../../assets/images/paper-texture.webp")}
        style={[StyleSheet.absoluteFill, { opacity: dark ? 0.13 : 0.2 }]}
        contentFit="cover"
        accessible={false}
      />
    </View>
  );
}

export function BrandLockup() {
  const t = useTheme();
  useLocale();
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: t.spacing.sm }}
    >
      <Image
        source={require("../../assets/branding/logo-green.png")}
        style={{ width: 32, height: 36, tintColor: t.colors.green }}
        contentFit="contain"
        accessible={false}
      />
      <Text
        style={{
          fontFamily: t.fonts.display,
          color: t.colors.ink,
          fontSize: 24,
          letterSpacing: -0.6,
        }}
      >
        Yerbarium
      </Text>
    </View>
  );
}
export function Display({
  children,
  accent = false,
  size,
  color,
}: React.PropsWithChildren<{
  accent?: boolean;
  size?: number;
  color?: string;
}>) {
  const t = useTheme();
  size ??= t.type.display;

  useLocale();
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: t.fonts.display,
        fontSize: size,
        lineHeight: size * 1.02,
        color: color ?? (accent ? t.colors.lime : t.colors.onDark),
        textTransform: "uppercase",
        letterSpacing: -0.5,
      }}
    >
      {children}
    </Text>
  );
}
export function HandNote({
  children,
  light = false,
  rotate = true,
}: React.PropsWithChildren<{ light?: boolean; rotate?: boolean }>) {
  const t = useTheme();
  useLocale();
  return (
    <Text
      style={{
        fontFamily: t.fonts.hand,
        fontSize: t.type.hand,
        lineHeight: 27,
        color: light ? t.colors.lime : t.colors.green,
        transform: [{ rotate: rotate ? "-4deg" : "0deg" }],
      }}
    >
      {children}
    </Text>
  );
}
export function SectionHeading({
  compact = false,
  title,
  action,
  onPress,
}: {
  title: string;
  compact?: boolean;
  action?: string;
  onPress?: () => void;
}) {
  const t = useTheme();
  useLocale();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: t.spacing.md,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{
          fontFamily: t.fonts.display,
          fontSize: compact ? 22 : t.type.title,
          lineHeight: compact ? 27 : 31,
          color: t.colors.ink,
          flex: 1,
          textTransform: compact ? "none" : "uppercase",
        }}
      >
        {title}
      </Text>
      {action && onPress && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action}
          onPress={onPress}
          style={{
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            gap: t.spacing.xs,
          }}
        >
          <Text
            style={{
              fontFamily: t.fonts.bold,
              fontSize: t.type.caption,
              color: t.colors.green,
            }}
          >
            {action}
          </Text>
          <Icon name="arrow" size={16} />
        </Pressable>
      )}
    </View>
  );
}
export function EditorialHero({
  title,
  accent,
  ending,
  description,
  children,
  compact = false,
  paper = false,
  accessory,
}: React.PropsWithChildren<{
  title: string;
  accent?: string;
  ending?: string;
  description?: string;
  compact?: boolean;
  paper?: boolean;
  accessory?: React.ReactNode;
}>) {
  const t = useTheme();
  useLocale();
  return (
    <View
      style={{
        backgroundColor: paper ? t.colors.background : t.colors.hero,
        isolation: "isolate",
        padding: t.spacing.lg,
        paddingBottom: accessory ? t.spacing.lg : t.spacing.xl,
        gap: t.spacing.md,
        overflow: "hidden",
        borderRadius: t.radius.card,
        borderCurve: "continuous",
        marginHorizontal: compact ? t.spacing.md : t.spacing.lg,
        marginTop: compact ? t.spacing.md : t.spacing.lg,
      }}
    >
      {!paper && <Paper dark />}
      {!paper && !accessory && (
        <Image
          source={require("../../assets/images/mate-botanical.webp")}
          style={{
            position: "absolute",
            width: compact ? 140 : 190,
            height: compact ? 140 : 190,
            right: -28,
            top: 14,
            opacity: 0.22,
          }}
          contentFit="contain"
          accessible={false}
        />
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing.md,
        }}
      >
        <View style={{ gap: t.spacing.xs, flex: 1, minWidth: 0 }}>
          <Display
            color={paper ? t.colors.ink : t.colors.onDark}
            size={compact ? 34 : 39}
          >
            {title}
          </Display>
          {accent && (
            <Display
              color={paper ? t.colors.green : t.colors.lime}
              size={compact ? 34 : 39}
            >
              {accent}
            </Display>
          )}
          {ending && <Display size={compact ? 34 : 39}>{ending}</Display>}
        </View>
        {accessory}
      </View>
      {description && (
        <Text
          style={{
            fontFamily: t.fonts.body,
            fontSize: t.type.body,
            lineHeight: 23,
            color: paper ? t.colors.ink : t.colors.onDark,
            maxWidth: 360,
          }}
        >
          {description}
        </Text>
      )}
      {children}
    </View>
  );
}
export function SearchBox({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Buscar yerba o marca…",
  autoFocus = false,
}: {
  value?: string;
  onChangeText?: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const t = useTheme();
  const e = useThemedStyles(createE);
  useLocale();
  const input = React.useRef<TextInput>(null);
  const [focused, setFocused] = React.useState(false);
  if (!onChangeText)
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tr("Buscar yerbas y marcas")}
        onPress={onSubmit}
        style={({ pressed }) => [e.search, { opacity: pressed ? 0.75 : 1 }]}
      >
        <Icon name="search" />
        <Text
          style={{
            fontFamily: t.fonts.bold,
            fontSize: 15,
            color: t.colors.muted,
            flex: 1,
          }}
        >
          {tr(placeholder)}
        </Text>
        <View style={e.searchAction}>
          <Icon name="arrow" size={20} color={t.colors.onAction} />
        </View>
      </Pressable>
    );
  return (
    <View style={[e.search, focused && { borderColor: t.colors.green }]}>
      <Icon name="search" />
      <TextInput
        ref={input}
        autoFocus={autoFocus}
        accessibilityLabel={tr("Buscar yerba o marca")}
        value={value}
        onChangeText={onChangeText}
        placeholder={tr(placeholder)}
        placeholderTextColor={t.colors.muted}
        style={{
          flex: 1,
          fontFamily: t.fonts.body,
          fontSize: t.type.body,
          color: t.colors.ink,
          minHeight: 44,
        }}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
        selectionColor={t.colors.green}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value ? tr("Limpiar búsqueda") : tr("Buscar")}
        onPress={() => {
          if (value) onChangeText("");
          else if (onSubmit) onSubmit();
          else input.current?.focus();
        }}
        style={({ pressed }) => [
          e.searchAction,
          { opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Icon
          name={value ? "close" : "arrow"}
          size={20}
          color={t.colors.onAction}
        />
      </Pressable>
    </View>
  );
}
const createE = (t: AppTheme) =>
  StyleSheet.create({
    search: {
      minHeight: 60,
      paddingLeft: t.spacing.md,
      paddingRight: 7,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: t.radius.pill,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.cream,
    },
    searchAction: {
      width: 44,
      height: 44,
      borderRadius: t.radius.pill,
      backgroundColor: t.colors.action,
      alignItems: "center",
      justifyContent: "center",
    },
  });
