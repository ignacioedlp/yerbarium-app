import React from "react";
import { Alert, Pressable } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import {
  blockUser,
  reportReview,
  reportUser,
  unblockUser,
} from "@/api/community-safety";
import { ReportReason } from "@/api/community-types";
import { Icon } from "@/components/icon";
import { useSession } from "@/providers/session";
import { theme } from "@/theme";

const reasons: { key: ReportReason; label: string }[] = [
  { key: "SPAM", label: "Spam o publicidad" },
  { key: "ABUSE", label: "Acoso o abuso" },
  { key: "HATE", label: "Discurso de odio" },
  { key: "INAPPROPRIATE", label: "Contenido inapropiado" },
  { key: "OTHER", label: "Otro motivo" },
];

export function CommunitySafetyActions({
  username,
  reviewId,
  isBlocked = false,
  onBlockChange,
}: {
  username: string;
  reviewId?: number;
  isBlocked?: boolean;
  onBlockChange?: (blocked: boolean) => void;
}) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [blocked, setBlocked] = React.useState(isBlocked);
  const [pending, setPending] = React.useState(false);

  if (!user || user.username === username) return null;

  async function submitReport(reason: ReportReason, target: "review" | "user") {
    setPending(true);
    try {
      if (target === "review" && reviewId) await reportReview(reviewId, reason);
      else await reportUser(username, reason);
      Alert.alert(
        "Reporte enviado",
        "Gracias. Lo revisará el equipo de moderación.",
      );
    } catch {
      Alert.alert("No se pudo enviar", "Intentá nuevamente más tarde.");
    } finally {
      setPending(false);
    }
  }

  function chooseReason(target: "review" | "user") {
    Alert.alert(
      target === "review" ? "Reportar opinión" : "Reportar usuario",
      "Elegí el motivo del reporte.",
      [
        ...reasons.map(({ key, label }) => ({
          text: label,
          onPress: () => void submitReport(key, target),
        })),
        { text: "Cancelar", style: "cancel" as const },
      ],
    );
  }

  async function toggleBlock() {
    setPending(true);
    try {
      if (blocked) {
        await unblockUser(username);
        setBlocked(false);
        onBlockChange?.(false);
        Alert.alert(
          "Usuario desbloqueado",
          `Volvés a ver el perfil de @${username}.`,
        );
      } else {
        await blockUser(username);
        setBlocked(true);
        onBlockChange?.(true);
        Alert.alert(
          "Usuario bloqueado",
          `Ya no vas a ver el perfil ni las opiniones de @${username}.`,
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["public"] });
      await queryClient.invalidateQueries({ queryKey: ["private"] });
    } catch {
      Alert.alert("No se pudo actualizar", "Intentá nuevamente más tarde.");
    } finally {
      setPending(false);
    }
  }

  function openMenu() {
    if (pending) return;
    Alert.alert("Opciones de comunidad", undefined, [
      ...(reviewId
        ? [{ text: "Reportar opinión", onPress: () => chooseReason("review") }]
        : []),
      { text: "Reportar usuario", onPress: () => chooseReason("user") },
      {
        text: blocked ? "Desbloquear usuario" : "Bloquear usuario",
        style: blocked ? "default" : "destructive",
        onPress: () => {
          if (blocked) void toggleBlock();
          else {
            Alert.alert(
              `¿Bloquear a @${username}?`,
              "No vas a ver sus opiniones ni su perfil. Podés deshacerlo después.",
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Bloquear",
                  style: "destructive",
                  onPress: () => void toggleBlock(),
                },
              ],
            );
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Más opciones de comunidad"
      accessibilityHint="Reportar opinión o usuario, o bloquear usuario"
      accessibilityState={{ disabled: pending }}
      disabled={pending}
      onPress={openMenu}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 22,
        opacity: pending || pressed ? 0.55 : 1,
      })}
    >
      <Icon name="more" size={24} color={theme.colors.green} />
    </Pressable>
  );
}
