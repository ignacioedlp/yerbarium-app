import { Platform } from "react-native";
import { tr } from "@/i18n";
import { ApiError, publicApi } from "./client";
import type { Account } from "./account-types";
import type { TokenPair } from "./session-manager";

export type SocialProvider = "google" | "apple";
export type SocialConfig = Record<SocialProvider, { client_id: string } | null>;
export type SocialSession = TokenPair & { user: Account; created: boolean };
export interface SocialLinkChallenge {
  kind: "link_required";
  complete: (password: string) => Promise<SocialSession>;
}
export async function socialConfig(signal?: AbortSignal) {
  return (
    await publicApi.get<SocialConfig>("auth/token/social/config/", { signal })
  ).data;
}

// Native SDKs are loaded on demand so an older development client can still open login.
export async function socialSignIn(
  provider: SocialProvider,
  config: SocialConfig,
  newsletter = false,
): Promise<SocialSession | SocialLinkChallenge | null> {
  if (!config[provider])
    throw new ApiError(
      tr("Este método de ingreso no está disponible en este momento."),
    );
  let idToken: string | null = null;
  let nonce: string | undefined;
  try {
    if (provider === "google") {
      const { GoogleSignin, isSuccessResponse } =
        await import("@react-native-google-signin/google-signin");
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      if (Platform.OS === "ios" && !iosClientId)
        throw new ApiError(
          tr("Falta configurar el ingreso con Google para iOS."),
        );
      GoogleSignin.configure({
        webClientId: config.google!.client_id,
        iosClientId,
      });
      if (Platform.OS === "android")
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      // Always let the person choose an account, including after signing out of Yerbarium.
      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) return null;
      idToken = result.data.idToken;
    } else {
      const Apple = await import("expo-apple-authentication");
      if (Platform.OS !== "ios" || !(await Apple.isAvailableAsync()))
        throw new ApiError(
          tr("El ingreso con Apple no está disponible en este dispositivo."),
        );
      nonce = (
        await publicApi.post<{ nonce: string }>(
          "auth/token/social/challenge/",
          { provider },
        )
      ).data.nonce;
      const result = await Apple.signInAsync({
        nonce,
        requestedScopes: [Apple.AppleAuthenticationScope.EMAIL],
      });
      idToken = result.identityToken;
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "ERR_REQUEST_CANCELED" || code === "SIGN_IN_CANCELLED")
      return null;
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      provider === "apple"
        ? tr("No pudimos iniciar sesión con Apple. Volvé a intentar.")
        : tr("No pudimos iniciar sesión con Google. Volvé a intentar."),
    );
  }
  if (!idToken)
    throw new ApiError(
      tr("No pudimos obtener tu identidad. Volvé a intentar."),
    );
  const payload = {
    provider,
    id_token: idToken,
    ...(nonce ? { nonce } : {}),
    newsletter,
  };
  const exchange = async (password?: string): Promise<SocialSession> =>
    (
      await publicApi.post<SocialSession>("auth/token/social/login/", {
        ...payload,
        ...(password === undefined ? {} : { link_password: password }),
      })
    ).data;
  try {
    return await exchange();
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 409 &&
      error.fields.code?.includes("account_link_required")
    ) {
      // Retain the credential only in this closure, until confirmation or cancellation.
      return { kind: "link_required", complete: exchange };
    }
    throw error;
  }
}
