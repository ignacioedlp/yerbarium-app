import React from "react";
import { Platform, View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  socialConfig,
  socialSignIn,
  type SocialProvider,
  type SocialLinkChallenge,
} from "@/api/social-auth";
import { ApiError, normalizeError } from "@/api/client";
import { SocialProviderButton } from "@/components/social-provider-button";
import { AuthField } from "@/components/auth-sheet";
import { Body, Button, ErrorMessage } from "@/components/ui";
import { useSession } from "@/providers/session";
import { theme } from "@/theme";
import { tr, useLocale } from "@/i18n";

export function useSocialAuth({
  newsletter = false,
  reauthenticate = false,
} = {}) {
  const session = useSession();
  const [pendingLink, setPendingLink] =
    React.useState<SocialLinkChallenge | null>(null);
  const config = useQuery({
    queryKey: ["social-auth-config"],
    queryFn: ({ signal }) => socialConfig(signal),
    staleTime: 60_000,
    retry: false,
  });
  const availability = useQuery({
    queryKey: ["apple-sign-in-available"],
    queryFn: async () => {
      try {
        return await (
          await import("expo-apple-authentication")
        ).isAvailableAsync();
      } catch {
        return false;
      }
    },
    enabled: Platform.OS === "ios" && Boolean(config.data?.apple),
    staleTime: Infinity,
  });
  const mutation = useMutation({
    mutationFn: async (input: SocialProvider | { password: string }) => {
      if (!config.data)
        throw new ApiError(
          tr("Este método de ingreso no está disponible en este momento."),
        );
      const data =
        typeof input === "string"
          ? await socialSignIn(input, config.data, newsletter)
          : await pendingLink?.complete(input.password);
      if (data && "kind" in data) {
        setPendingLink(data);
        return null;
      }
      if (!data) return null;
      if (reauthenticate && data.user.id !== session.user?.id)
        throw new ApiError(
          tr("Ingresá con la misma cuenta para confirmar tu identidad."),
        );
      await session.acceptSocialSession(data);
      setPendingLink(null);
      return data;
    },
    onSuccess: (data) => {
      if (!data || reauthenticate) return;
      if (data.created)
        router.replace({
          pathname: "/ajustes/notificaciones",
          params: { onboarding: "1" },
        });
      else if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/perfil");
    },
  });
  return {
    config,
    mutation,
    pendingLink,
    cancelLink: () => {
      setPendingLink(null);
      mutation.reset();
    },
    appleAvailable: availability.data === true,
  };
}
export function SocialAuthButtons({
  auth,
  disabled,
  showEmailSeparator = true,
}: {
  auth: ReturnType<typeof useSocialAuth>;
  disabled: boolean;
  showEmailSeparator?: boolean;
}) {
  useLocale();
  const [password, setPassword] = React.useState("");
  const google =
    Boolean(auth.config.data?.google) &&
    (Platform.OS !== "ios" ||
      Boolean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID));
  const apple = Boolean(auth.config.data?.apple) && auth.appleAvailable;
  return (
    <View style={{ gap: 12 }}>
      {google && (
        <SocialProviderButton
          provider="google"
          disabled={disabled || Boolean(auth.pendingLink)}
          onPress={() => auth.mutation.mutate("google")}
        />
      )}
      {apple && (
        <SocialProviderButton
          provider="apple"
          disabled={disabled || Boolean(auth.pendingLink)}
          onPress={() => auth.mutation.mutate("apple")}
        />
      )}
      {showEmailSeparator && (google || apple) && !auth.pendingLink && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginTop: 4,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: theme.colors.subtleBorder,
            }}
          />
          <Body muted>{tr("O continuá con tu email")}</Body>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: theme.colors.subtleBorder,
            }}
          />
        </View>
      )}
      {auth.pendingLink && (
        <View style={{ gap: 12 }}>
          <Body>
            {tr(
              "Para vincular este método de ingreso, confirmá la contraseña de tu cuenta existente.",
            )}
          </Body>
          <AuthField
            label={tr("Contraseña actual")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            editable={!auth.mutation.isPending}
            onSubmitEditing={() => {
              if (password && !auth.mutation.isPending) {
                auth.mutation.mutate({ password });
                setPassword("");
              }
            }}
          />
          <Button
            label={tr("Vincular e ingresar")}
            disabled={!password || auth.mutation.isPending}
            onPress={() => {
              auth.mutation.mutate({ password });
              setPassword("");
            }}
          />
          <Button
            secondary
            label={tr("Cancelar")}
            disabled={auth.mutation.isPending}
            onPress={() => {
              setPassword("");
              auth.cancelLink();
            }}
          />
        </View>
      )}
      {auth.config.error && (
        <Button
          secondary
          label={tr("Reintentar métodos de ingreso")}
          disabled={disabled || auth.config.isFetching}
          onPress={() => void auth.config.refetch()}
        />
      )}
      {auth.mutation.error && (
        <ErrorMessage message={normalizeError(auth.mutation.error).message} />
      )}
    </View>
  );
}
