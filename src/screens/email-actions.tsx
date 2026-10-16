import { tr, useLocale } from "@/i18n";
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
  useLocale();
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
            ? tr(
                "La contraseña ya cambió. Iniciá sesión con la nueva contraseña.",
              )
            : tr(
                "El email ya se verificó. Volvé a Perfil y actualizá el estado cuando tengas conexión.",
              ),
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
      setValidation(tr("Ingresá un email válido."));
      return;
    }
    if (
      mode === "reset" &&
      (password.length < 8 || password !== confirmation)
    ) {
      setValidation(
        tr("Usá al menos ocho caracteres y repetí la misma contraseña."),
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
          ? tr("Nueva contraseña")
          : mode === "verify"
            ? tr("Verificá tu email")
            : tr("Recuperá tu cuenta")
      }
      description={
        mode === "reset"
          ? tr("Elegí una contraseña segura para volver a ingresar.")
          : mode === "verify"
            ? tr("Confirmá que este email te pertenece.")
            : tr("Te enviamos un enlace para cambiar tu contraseña.")
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
                    ? tr("Procesando…")
                    : mode === "reset"
                      ? tr("Guardar contraseña")
                      : mode === "verify" && token
                        ? tr("Verificar mi email")
                        : mode === "verify"
                          ? tr("Reenviar verificación")
                          : tr("Enviar enlace")
                }
                disabled={mutation.isPending || !online}
                onPress={submit}
              />
            )}
          {(missing || Boolean(mutation.error && token)) && (
            <Button
              label={tr("Solicitar otro enlace")}
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
                  ? tr("Volver a la verificación")
                  : tr("Volver al formulario")
              }
              secondary
              onPress={() => mutation.reset()}
            />
          )}
          <Button
            label={
              mode === "verify" && session.user
                ? tr("Ir a mi perfil")
                : tr("Ir a ingresar")
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
          {tr("Ingresá a tu cuenta para reenviar la verificación a tu email.")}
        </Body>
      ) : alreadyVerified ? (
        <Body>{tr("Tu email ya está verificado.")}</Body>
      ) : missing ? (
        <ErrorMessage
          message={tr("El enlace no es válido. Solicitá uno nuevo.")}
        />
      ) : mutation.isSuccess ? (
        <View accessibilityLiveRegion="polite">
          <Body>
            {tr(
              mode === "reset"
                ? "Tu contraseña se actualizó."
                : mode === "verify" && token
                  ? "Tu email ya está verificado."
                  : "Si el email corresponde a una cuenta, recibirás un enlace. Revisá tu bandeja de entrada.",
            )}
          </Body>
          {syncError ? <Body>{syncError}</Body> : null}
          {!token && (
            <Body>
              {tr(
                "Si no llega, revisá spam. Esperá un minuto antes de pedir otro enlace.",
              )}
            </Body>
          )}
        </View>
      ) : (
        <>
          {mode === "verify" && !token && (
            <Body>
              {tr(
                "Enviamos automáticamente un enlace de verificación a {email} al crear tu cuenta. Abrilo para confirmar tu email. Si no lo encontrás, revisá spam o reenviá el correo.",
                { email: session.user?.email },
              )}
            </Body>
          )}
          {mode === "request" && (
            <AuthField
              label={tr("Email de tu cuenta")}
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
                label={tr("Nueva contraseña")}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!mutation.isPending}
              />
              <AuthField
                label={tr("Repetí la contraseña")}
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
  useLocale();
  return <EmailActionScreen mode="request" />;
}
export function ResetPassword() {
  useLocale();
  return <EmailActionScreen mode="reset" />;
}
export function VerifyEmail() {
  useLocale();
  return <EmailActionScreen mode="verify" />;
}

export function EmailVerificationStatus() {
  useLocale();
  const session = useSession();
  const online = useCanWrite();
  const refresh = useMutation({ mutationFn: session.reload });
  if (session.user?.email_verified) return null;
  return (
    <View style={{ gap: 8 }}>
      <Body>{tr("Tu email está pendiente de verificación.")}</Body>
      {!session.user?.email_verified && (
        <>
          <Button
            label={tr("Verificar email")}
            secondary
            onPress={() => router.push("/verificar-email")}
          />
          <Button
            label={
              refresh.isPending
                ? tr("Actualizando…")
                : tr("Ya lo verifiqué: actualizar")
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
