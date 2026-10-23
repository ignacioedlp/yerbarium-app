import { tr, useLocale } from "@/i18n";
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
import { useTheme } from "@/theme";

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
  const theme = useTheme();
  useLocale();
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
        tr("Reporte enviado"),
        tr("Gracias. Lo revisará el equipo de moderación."),
      );
    } catch {
      Alert.alert(tr("No se pudo enviar"), tr("Intentá nuevamente más tarde."));
    } finally {
      setPending(false);
    }
  }

  function chooseReason(target: "review" | "user") {
    Alert.alert(
      target === "review" ? tr("Reportar opinión") : tr("Reportar usuario"),
      tr("Elegí el motivo del reporte."),
      [
        ...reasons.map(({ key, label }) => ({
          text: tr(label),
          onPress: () => void submitReport(key, target),
        })),
        { text: tr("Cancelar"), style: "cancel" as const },
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
          tr("Usuario desbloqueado"),
          tr("Volvés a ver el perfil de @{0}.", { 0: username }),
        );
      } else {
        await blockUser(username);
        setBlocked(true);
        onBlockChange?.(true);
        Alert.alert(
          tr("Usuario bloqueado"),
          tr("Ya no vas a ver el perfil ni las opiniones de @{0}.", {
            0: username,
          }),
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["public"] });
      await queryClient.invalidateQueries({ queryKey: ["private"] });
    } catch {
      Alert.alert(
        tr("No se pudo actualizar"),
        tr("Intentá nuevamente más tarde."),
      );
    } finally {
      setPending(false);
    }
  }

  function openMenu() {
    if (pending) return;
    Alert.alert(tr("Opciones de comunidad"), undefined, [
      ...(reviewId
        ? [
            {
              text: tr("Reportar opinión"),
              onPress: () => chooseReason("review"),
            },
          ]
        : []),
      { text: tr("Reportar usuario"), onPress: () => chooseReason("user") },
      {
        text: blocked ? tr("Desbloquear usuario") : tr("Bloquear usuario"),
        style: blocked ? "default" : "destructive",
        onPress: () => {
          if (blocked) void toggleBlock();
          else {
            Alert.alert(
              tr("¿Bloquear a @{0}?", { 0: username }),
              tr(
                "No vas a ver sus opiniones ni su perfil. Podés deshacerlo después.",
              ),
              [
                { text: tr("Cancelar"), style: "cancel" },
                {
                  text: tr("Bloquear"),
                  style: "destructive",
                  onPress: () => void toggleBlock(),
                },
              ],
            );
          }
        },
      },
      { text: tr("Cancelar"), style: "cancel" },
    ]);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tr("Más opciones de comunidad")}
      accessibilityHint={tr("Reportar opinión o usuario, o bloquear usuario")}
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
