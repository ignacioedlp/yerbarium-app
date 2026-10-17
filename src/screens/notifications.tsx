import React, { useEffect, useState } from "react";
import { AppState, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Body, Button, ErrorMessage, Page, Title } from "@/components/ui";
import { PreferenceToggle } from "@/components/preference-toggle";
import { useSession } from "@/providers/session";
import { get, write, normalizeError } from "@/api/client";
import {
  NotificationPreferences,
  notificationLabels,
} from "@/api/notification-types";
import { pushPermission, registerPush } from "@/api/push";
import { tr, useLocale } from "@/i18n";
const path = "auth/notification-preferences/";
export function NotificationSettings() {
  useLocale();
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const { user } = useSession();
  const client = useQueryClient();
  const queryKey = ["private", path, user?.id] as const;
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      get<NotificationPreferences>(path, undefined, signal, true),
    enabled: Boolean(user),
  });
  const [permission, setPermission] =
    useState<Awaited<ReturnType<typeof pushPermission>>>();
  const [permissionError, setPermissionError] = useState(false);
  const [activating, setActivating] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void pushPermission()
        .then((p) => {
          if (active) setPermission(p);
        })
        .catch(() => {
          if (active) setPermissionError(true);
        });
    };
    refresh();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      active = false;
      listener.remove();
    };
  }, []);
  const mutation = useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) =>
      write<NotificationPreferences>(path, "PATCH", data),
    onSuccess: (data) => {
      client.setQueryData(queryKey, data);
    },
  });
  const finish = () => router.replace("/verificar-email");
  const activate = async () => {
    if (!user?.id) return;
    setPermissionError(false);
    setActivating(true);
    try {
      const result = await registerPush(user.id, true);
      setPermission(result);
      if (onboarding === "1") finish();
    } catch {
      setPermissionError(true);
    } finally {
      setActivating(false);
    }
  };
  if (!user)
    return (
      <Page>
        <Body>{tr("Ingresá para configurar tus notificaciones.")}</Body>
        <Button
          label={tr("Ingresar")}
          onPress={() => router.push("/ingresar")}
        />
      </Page>
    );
  return (
    <Page>
      <Title>{tr("Notificaciones")}</Title>
      <Body>
        {tr("Elegí qué querés recibir. Podés cambiarlo cuando quieras.")}
      </Body>
      {query.isPending && <Body>{tr("Cargando…")}</Body>}
      {query.isError && (
        <>
          <ErrorMessage message={normalizeError(query.error).message} />
          <Button
            label={tr("Reintentar")}
            onPress={() => void query.refetch()}
          />
        </>
      )}
      {query.data &&
        (
          Object.keys(notificationLabels) as (keyof NotificationPreferences)[]
        ).map((key) => (
          <PreferenceToggle
            key={key}
            testID={`notification-${key}`}
            label={tr(notificationLabels[key])}
            value={query.data[key]}
            disabled={mutation.isPending || activating}
            onChange={(value) => mutation.mutate({ [key]: value })}
          />
        ))}
      <Body muted>
        {tr(
          "Marcas y descubrimiento: guardamos tu elección para futuras novedades.",
        )}
      </Body>
      <Body muted>
        {tr(
          "El newsletter es opcional e independiente de las notificaciones push y los emails de tu cuenta.",
        )}
      </Body>
      {mutation.error && (
        <ErrorMessage message={normalizeError(mutation.error).message} />
      )}
      <Body>
        {permission?.granted
          ? tr("Notificaciones habilitadas en este dispositivo.")
          : tr("Notificaciones desactivadas en este dispositivo.")}
      </Body>
      {permissionError && (
        <ErrorMessage
          message={tr(
            "No pudimos activar las notificaciones. Volvé a intentar.",
          )}
        />
      )}
      {permission && !permission.granted && !permission.canAskAgain ? (
        <Button
          label={tr("Abrir ajustes del sistema")}
          secondary
          onPress={() =>
            void Linking.openSettings().catch(() => setPermissionError(true))
          }
        />
      ) : (
        <Button
          label={
            permission?.granted
              ? tr("Sincronizar dispositivo")
              : tr("Activar notificaciones")
          }
          disabled={
            activating || query.isPending || query.isError || mutation.isPending
          }
          onPress={() => void activate()}
        />
      )}
      {onboarding === "1" && (
        <Button
          secondary
          label={tr("Ahora no")}
          disabled={activating || mutation.isPending}
          onPress={finish}
        />
      )}
    </Page>
  );
}
