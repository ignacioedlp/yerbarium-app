import { gamificationPath, type OwnGamification } from "@/api/gamification";
import { getOwnGamification } from "@/api/gamification";
import { Icon } from "@/components/icon";
import { useSession } from "@/providers/session";
import { tr } from "@/i18n";
import { useTheme, useThemedStyles, type AppTheme } from "@/theme";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastEvent = { id: number; title: string; detail: string };

export function GamificationToastObserver() {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user, ready } = useSession();
  const insets = useSafeAreaInsets();
  const query = useQuery<OwnGamification>({
    queryKey: ["private", gamificationPath, user?.username],
    queryFn: ({ signal }) => getOwnGamification(signal),
    enabled: ready && !!user,
    staleTime: 0,
  });
  const previous = useRef<{ user: string; data: OwnGamification } | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toast, setToast] = useState<ToastEvent | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    const username = user?.username;
    const data = query.data;
    if (!username || !data) {
      previous.current = null;
      setToast(null);
      return;
    }
    const old = previous.current;
    previous.current = { user: username, data };
    if (!old || old.user !== username) return;

    const xp = data.total_xp - old.data.total_xp;
    const newAchievements = data.achievements.filter(
      (item) =>
        item.status === "unlocked" &&
        !old.data.achievements.some(
          (prior) => prior.key === item.key && prior.status === "unlocked",
        ),
    );
    const messages: string[] = [];
    if (xp > 0) messages.push(tr("+{0} XP", { 0: xp }));
    for (const achievement of newAchievements) {
      messages.push(tr("{0}", { 0: tr(achievement.name) }));
    }
    if (data.level > old.data.level) {
      messages.push(tr("¡Subiste al nivel {0}!", { 0: data.level }));
    }
    if (!messages.length) return;

    const title =
      data.level > old.data.level
        ? tr("¡Nuevo nivel!")
        : newAchievements.length
          ? tr("¡Logro desbloqueado!")
          : tr("¡Sumaste experiencia!");
    setToast({ id: ++nextId.current, title, detail: messages.join(" · ") });
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setToast(null), 4200);
  }, [query.data, user?.username]);

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );

  if (!toast) return null;
  return (
    <View
      pointerEvents="none"
      style={[styles.anchor, { top: insets.top + 10 }]}
    >
      <View
        key={toast.id}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={styles.toast}
      >
        <View style={styles.mark}>
          <Icon name="leaf" size={23} color={theme.colors.deep} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{toast.title}</Text>
          <Text style={styles.detail}>{toast.detail}</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    anchor: {
      position: "absolute",
      left: 16,
      right: 16,
      alignItems: "center",
      zIndex: 1000,
    },
    toast: {
      width: "100%",
      maxWidth: 480,
      minHeight: 72,
      borderRadius: 20,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: theme.colors.deep,
      borderWidth: 1,
      borderColor: "rgba(255,248,232,0.22)",
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    mark: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.lime,
    },
    copy: { flex: 1, gap: 2 },
    title: {
      color: theme.colors.onDark,
      fontFamily: theme.fonts.bold,
      fontSize: 16,
    },
    detail: {
      color: theme.colors.lime,
      fontFamily: theme.fonts.body,
      fontSize: 13,
    },
  });
