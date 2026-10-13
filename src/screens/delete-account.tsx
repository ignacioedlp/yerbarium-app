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
  const session = useSession();
  const online = useCanWrite();
  const [password, setPassword] = React.useState("");
  const deletion = useMutation({
    mutationFn: () => write<void>("auth/me/", "DELETE", { password }),
    onSuccess: async () => {
      await session.logout();
      router.replace("/(tabs)/(home)");
    },
  });

  function confirmDeletion() {
    if (!password) return;
    Alert.alert(
      "Eliminar tu cuenta",
      "Se borrarán tu perfil, tu biblioteca y tus opiniones. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar cuenta",
          style: "destructive",
          onPress: () => deletion.mutate(),
        },
      ],
    );
  }

  return (
    <Page>
      <Stack.Screen options={{ title: "Eliminar cuenta", headerShown: true }} />
      <Title>Eliminar cuenta</Title>
      <Body>
        Esta acción elimina tu perfil, biblioteca y opiniones. Para confirmar,
        volvé a ingresar tu contraseña.
      </Body>
      <Field
        label="Contraseña actual"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        editable={!deletion.isPending}
      />
      {deletion.error && (
        <ErrorMessage message={normalizeError(deletion.error).message} />
      )}
      <Button
        label={deletion.isPending ? "Eliminando…" : "Eliminar mi cuenta"}
        destructive
        disabled={!online || !password || deletion.isPending}
        onPress={confirmDeletion}
      />
    </Page>
  );
}
