import { SocialAuthButtons, useSocialAuth } from "@/components/social-auth";
import { tr, useLocale } from "@/i18n";
import React from "react";
import { Alert } from "react-native";
import { router, Stack } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { normalizeError, write } from "@/api/client";
import {
  Body,
  Button,
  ErrorMessage,
  Field,
  Page,
  Title,
  useCanWrite,
} from "@/components/ui";
import { useSession } from "@/providers/session";

export function DeleteAccount() {
  useLocale();
  const session = useSession();
  const social = useSocialAuth({ reauthenticate: true });
  const passwordless = session.user?.has_password === false;
  const [confirmation, setConfirmation] = React.useState("");
  const online = useCanWrite();
  const [password, setPassword] = React.useState("");
  const deletion = useMutation({
    mutationFn: () =>
      write<void>(
        "auth/me/",
        "DELETE",
        passwordless ? { confirm_username: confirmation } : { password },
      ),
    onSuccess: async () => {
      await session.logout();
      router.replace("/(tabs)/(home)");
    },
  });

  function confirmDeletion() {
    if (passwordless ? confirmation !== session.user?.username : !password)
      return;
    Alert.alert(
      tr("Eliminar tu cuenta"),
      tr(
        "Se borrarán tu perfil, tu biblioteca y tus opiniones. Esta acción no se puede deshacer.",
      ),
      [
        { text: tr("Cancelar"), style: "cancel" },
        {
          text: tr("Eliminar cuenta"),
          style: "destructive",
          onPress: () => deletion.mutate(),
        },
      ],
    );
  }

  return (
    <Page>
      <Stack.Screen
        options={{ title: tr("Eliminar cuenta"), headerShown: true }}
      />
      <Title>{tr("Eliminar cuenta")}</Title>
      <Body>
        {passwordless
          ? tr(
              "Confirmá tu identidad con Google o Apple y escribí tu usuario para eliminar la cuenta.",
            )
          : tr(
              "Esta acción elimina tu perfil, biblioteca y opiniones. Para confirmar, volvé a ingresar tu contraseña.",
            )}
      </Body>
      {passwordless && (
        <SocialAuthButtons
          auth={social}
          showEmailSeparator={false}
          disabled={!online || deletion.isPending || social.mutation.isPending}
        />
      )}
      {passwordless && <Body>@{session.user?.username}</Body>}
      <Field
        label={passwordless ? tr("Confirmar usuario") : tr("Contraseña actual")}
        value={passwordless ? confirmation : password}
        onChangeText={passwordless ? setConfirmation : setPassword}
        secureTextEntry={!passwordless}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType={passwordless ? "username" : "password"}
        editable={!deletion.isPending && !social.mutation.isPending}
      />
      {deletion.error && (
        <ErrorMessage message={normalizeError(deletion.error).message} />
      )}
      <Button
        label={
          deletion.isPending ? tr("Eliminando…") : tr("Eliminar mi cuenta")
        }
        destructive
        disabled={
          !online ||
          (passwordless
            ? confirmation !== session.user?.username || !social.mutation.data
            : !password) ||
          deletion.isPending ||
          social.mutation.isPending
        }
        onPress={confirmDeletion}
      />
    </Page>
  );
}
