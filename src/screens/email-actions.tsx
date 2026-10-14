import React, { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { AuthField, AuthSheet } from "@/components/auth-sheet";
import { Body, Button, ErrorMessage, useCanWrite } from "@/components/ui";
import { normalizeError, publicApi } from "@/api/client";
import { useSession } from "@/providers/session";

export function EmailActionScreen({
  mode,
}: {
  mode: "request" | "reset" | "verify";
}) {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = typeof params.token === "string" ? params.token : "";
  const session = useSession();
  const online = useCanWrite();
  const [email, setEmail] = useState(session.user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [validation, setValidation] = useState("");
  const [syncError, setSyncError] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      const action =
        mode === "reset"
          ? "password-reset/confirm"
          : mode === "verify" && token
            ? "email-verification/confirm"
            : mode === "verify"
              ? "email-verification"
              : "password-reset";
      return (
        await publicApi.post<{ detail: string }>(
          `auth/token/${action}/`,
          token
            ? { token, ...(mode === "reset" ? { password } : {}) }
            : { email: mode === "verify" ? session.user!.email : email.trim() },
        )
      ).data;
    },
    onSuccess: async () => {
      setPassword("");
      setConfirmation("");
      setSyncError("");
      try {
        if (mode === "reset") await session.logout();
        if (mode === "verify" && token && session.user) await session.reload();
      } catch {
        setSyncError(
          mode === "reset"
            ? "La contraseña ya cambió. Iniciá sesión con la nueva contraseña."
            : "El email ya se verificó. Volvé a Perfil y actualizá el estado cuando tengas conexión.",
        );
      }
    },
  });
  function submit() {
    setValidation("");
    if (
      mode === "request" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setValidation("Ingresá un email válido.");
      return;
    }
    if (
      mode === "reset" &&
      (password.length < 8 || password !== confirmation)
    ) {
      setValidation(
        "Usá al menos ocho caracteres y repetí la misma contraseña.",
      );
      return;
    }
    mutation.mutate();
  }
  const missing = mode === "reset" && !token;
  const needsSession = mode === "verify" && !token && !session.user;
  const alreadyVerified =
    mode === "verify" && !token && session.user?.email_verified;
  return (
    <AuthSheet
      title={
        mode === "reset"
          ? "Nueva contraseña"
          : mode === "verify"
            ? "Verificá tu email"
            : "Recuperá tu cuenta"
      }
      description={
        mode === "reset"
          ? "Elegí una contraseña segura para volver a ingresar."
          : mode === "verify"
            ? "Confirmá que este email te pertenece."
            : "Te enviamos un enlace para cambiar tu contraseña."
      }
      pending={mutation.isPending}
      showClose={mode === "reset"}
      actions={
        <>
          {!mutation.isSuccess &&
            !missing &&
            !needsSession &&
            !alreadyVerified && (
              <Button
                label={
                  mutation.isPending
                    ? "Procesando…"
                    : mode === "reset"
                      ? "Guardar contraseña"
                      : mode === "verify" && token
                        ? "Verificar mi email"
                        : mode === "verify"
                          ? "Reenviar verificación"
                          : "Enviar enlace"
                }
                disabled={mutation.isPending || !online}
                onPress={submit}
              />
            )}
          {(missing || Boolean(mutation.error && token)) && (
            <Button
              label="Solicitar otro enlace"
              secondary
              onPress={() =>
                router.replace(
                  mode === "reset"
                    ? "/recuperar-contrasena"
                    : "/verificar-email",
                )
              }
            />
          )}
          {mutation.isSuccess && !token && (
            <Button
              label={
                mode === "verify"
                  ? "Volver a la verificación"
                  : "Volver al formulario"
              }
              secondary
              onPress={() => mutation.reset()}
            />
          )}
          <Button
            label={
              mode === "verify" && session.user
                ? "Ir a mi perfil"
                : "Ir a ingresar"
            }
            secondary
            disabled={mutation.isPending}
            onPress={() =>
              router.replace(
                mode === "verify" && session.user
                  ? "/(tabs)/perfil"
                  : "/ingresar",
              )
            }
          />
        </>
      }
    >
      {needsSession ? (
        <Body>
          Ingresá a tu cuenta para reenviar la verificación a tu email.
        </Body>
      ) : alreadyVerified ? (
        <Body>Tu email ya está verificado.</Body>
      ) : missing ? (
        <ErrorMessage message="El enlace no es válido. Solicitá uno nuevo." />
      ) : mutation.isSuccess ? (
        <View accessibilityLiveRegion="polite">
          <Body>{mutation.data.detail}</Body>
          {syncError ? <Body>{syncError}</Body> : null}
          {!token && (
            <Body>
              Si no llega, revisá spam. Esperá un minuto antes de pedir otro
              enlace.
            </Body>
          )}
        </View>
      ) : (
        <>
          {mode === "verify" && !token && (
            <Body>
              Enviamos automáticamente un enlace de verificación a{" "}
              {session.user?.email} al crear tu cuenta. Abrilo para confirmar tu
              email. Si no lo encontrás, revisá spam o reenviá el correo.
            </Body>
          )}
          {mode === "request" && (
            <AuthField
              label="Email de tu cuenta"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!mutation.isPending}
              maxLength={254}
            />
          )}
          {mode === "reset" && (
            <>
              <AuthField
                label="Nueva contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!mutation.isPending}
              />
              <AuthField
                label="Repetí la contraseña"
                value={confirmation}
                onChangeText={setConfirmation}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!mutation.isPending}
              />
            </>
          )}
          {validation ? <ErrorMessage message={validation} /> : null}
          {mutation.error && (
            <ErrorMessage message={normalizeError(mutation.error).message} />
          )}
        </>
      )}
    </AuthSheet>
  );
}

export function ForgotPassword() {
  return <EmailActionScreen mode="request" />;
}
export function ResetPassword() {
  return <EmailActionScreen mode="reset" />;
}
export function VerifyEmail() {
  return <EmailActionScreen mode="verify" />;
}

export function EmailVerificationStatus() {
  const session = useSession();
  const online = useCanWrite();
  const refresh = useMutation({ mutationFn: session.reload });
  if (session.user?.email_verified) return null;
  return (
    <View style={{ gap: 8 }}>
      <Body>Tu email está pendiente de verificación.</Body>
      {!session.user?.email_verified && (
        <>
          <Button
            label="Verificar email"
            secondary
            onPress={() => router.push("/verificar-email")}
          />
          <Button
            label={
              refresh.isPending
                ? "Actualizando…"
                : "Ya lo verifiqué: actualizar"
            }
            secondary
            disabled={!online || refresh.isPending}
            onPress={() => refresh.mutate()}
          />
          {refresh.error && (
            <ErrorMessage message={normalizeError(refresh.error).message} />
          )}
        </>
      )}
    </View>
  );
}
