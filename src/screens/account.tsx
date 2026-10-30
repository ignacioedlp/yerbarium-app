import { SocialAuthButtons, useSocialAuth } from "@/components/social-auth";
import { ProfileJourney } from "@/components/profile-journey";
import { PreferenceToggle } from "@/components/preference-toggle";
import { tr, useLocale } from "@/i18n";
import { AuthField, AuthSheet, AuthSwitch } from "@/components/auth-sheet";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Page,
  Title,
  Body,
  Button,
  Field,
  ErrorMessage,
  RequireSession,
  useCanWrite,
  openExternal,
} from "@/components/ui";
import { useSession } from "@/providers/session";
import { normalizeError, write } from "@/api/client";
import { Account } from "@/api/account-types";
import { profileSchema } from "@/api/profile-update";
import { Host, Switch } from "@expo/ui";
import { useTheme } from "@/theme";
import { ProfileSelect, profileCountries } from "@/components/profile-select";
import { Icon } from "@/components/icon";
const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Ingresá tu usuario o email."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});
const registrationSchema = z.object({
  username: z.string().trim().min(1, "Elegí un usuario.").max(150),
  email: z.email("Ingresá un email válido."),
  password: z.string().min(8, "Usá al menos ocho caracteres."),
});
const termsUrl = "https://yerbarium.vercel.app/terminos-y-condiciones/";
const privacyUrl = "https://yerbarium.vercel.app/privacidad/";
// Auth inputs own their native editing buffer; onChangeText keeps RHF in sync.
function LoginForm() {
  useLocale();
  const passwordInput = React.useRef<TextInput>(null);
  const session = useSession(),
    online = useCanWrite();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) =>
      session.login("login", values),
    onSuccess: () => router.back(),
  });
  const social = useSocialAuth();
  const pending =
    mutation.isPending ||
    social.mutation.isPending ||
    Boolean(social.pendingLink);
  return (
    <AuthSheet
      title={tr("Bienvenido de nuevo")}
      description={tr("Ingresá con tu usuario o email.")}
      pending={pending}
      actions={
        <>
          <Button
            label={mutation.isPending ? tr("Ingresando…") : tr("Ingresar")}
            disabled={pending || !online}
            onPress={form.handleSubmit((values) => mutation.mutate(values))}
          />
          <Button
            label={tr("¿Olvidaste tu contraseña?")}
            secondary
            disabled={pending}
            onPress={() => router.replace("/recuperar-contrasena")}
          />
          <AuthSwitch register={false} pending={pending} />
        </>
      }
    >
      <SocialAuthButtons auth={social} disabled={pending || !online} />
      {(["identifier", "password"] as const).map((name) => (
        <Controller
          key={name}
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <AuthField
              label={
                name === "identifier" ? tr("Usuario o email") : tr("Contraseña")
              }
              defaultValue=""
              editable={!pending}
              inputRef={(input) => {
                field.ref(input);
                if (name === "password") passwordInput.current = input;
              }}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={name === "password" ? "go" : "next"}
              submitBehavior="submit"
              onSubmitEditing={() => {
                if (name !== "password") passwordInput.current?.focus();
                else if (online && !pending)
                  void form.handleSubmit((values) => mutation.mutate(values))();
              }}
              secureTextEntry={name === "password"}
              textContentType={name === "password" ? "password" : "username"}
              error={fieldState.error?.message}
            />
          )}
        />
      ))}
      {mutation.error && (
        <ErrorMessage message={normalizeError(mutation.error).message} />
      )}
    </AuthSheet>
  );
}
function RegistrationForm() {
  const theme = useTheme();
  const [newsletter, setNewsletter] = React.useState(false);
  useLocale();
  const [legalLinkError, setLegalLinkError] = React.useState(false);
  const emailInput = React.useRef<TextInput>(null);
  const passwordInput = React.useRef<TextInput>(null);
  const session = useSession(),
    online = useCanWrite();
  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { username: "", email: "", password: "" },
  });
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof registrationSchema>) =>
      session.login("register", { ...values, newsletter }),
    onSuccess: () =>
      router.replace({
        pathname: "/ajustes/notificaciones",
        params: { onboarding: "1" },
      }),
    onError: (error) => {
      for (const [key, messages] of Object.entries(
        normalizeError(error).fields,
      ))
        if (key === "username" || key === "email" || key === "password")
          form.setError(key, { message: messages.join(" ") });
    },
  });
  const social = useSocialAuth({ newsletter });
  const pending =
    mutation.isPending ||
    social.mutation.isPending ||
    Boolean(social.pendingLink);
  return (
    <AuthSheet
      title={tr("Sumate a Yerbarium")}
      description={tr("Guardá tus yerbas y compartí lo que descubrís.")}
      pending={pending}
      actions={
        <>
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontSize: theme.type.caption,
              lineHeight: 19,
              textAlign: "center",
              color: theme.colors.muted,
            }}
          >
            {tr("Al crear una cuenta, aceptás los")}{" "}
            <Text
              accessibilityRole="link"
              onPress={() => {
                setLegalLinkError(false);
                void openExternal(termsUrl).catch(() =>
                  setLegalLinkError(true),
                );
              }}
              style={{
                color: theme.colors.green,
                fontFamily: theme.fonts.bold,
                textDecorationLine: "underline",
              }}
            >
              {tr("Términos y Condiciones")}
            </Text>
            . {tr("Consultá la")}{" "}
            <Text
              accessibilityRole="link"
              onPress={() => {
                setLegalLinkError(false);
                void openExternal(privacyUrl).catch(() =>
                  setLegalLinkError(true),
                );
              }}
              style={{
                color: theme.colors.green,
                fontFamily: theme.fonts.bold,
                textDecorationLine: "underline",
              }}
            >
              {tr("Política de privacidad")}
            </Text>
            .
          </Text>
          <PreferenceToggle
            label={tr("Quiero recibir novedades y newsletters por email")}
            value={newsletter}
            disabled={pending}
            onChange={setNewsletter}
          />
          {legalLinkError && (
            <ErrorMessage message={tr("No pudimos abrir el enlace legal.")} />
          )}
          <Button
            label={
              mutation.isPending ? tr("Creando cuenta…") : tr("Crear cuenta")
            }
            disabled={!online || pending}
            onPress={form.handleSubmit((values) => mutation.mutate(values))}
          />
          <AuthSwitch register pending={pending} />
        </>
      }
    >
      <SocialAuthButtons auth={social} disabled={pending || !online} />
      {(["username", "email", "password"] as const).map((name) => (
        <Controller
          key={name}
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <AuthField
              label={
                {
                  username: tr("Usuario"),
                  email: tr("Email"),
                  password: tr("Contraseña"),
                }[name]
              }
              defaultValue=""
              editable={!pending}
              inputRef={(input) => {
                field.ref(input);
                if (name === "email") emailInput.current = input;
                if (name === "password") passwordInput.current = input;
              }}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={name === "password" ? "go" : "next"}
              submitBehavior="submit"
              onSubmitEditing={() => {
                if (name === "username") emailInput.current?.focus();
                else if (name === "email") passwordInput.current?.focus();
                else if (online && !pending)
                  void form.handleSubmit((values) => mutation.mutate(values))();
              }}
              keyboardType={name === "email" ? "email-address" : "default"}
              hint={
                name === "password"
                  ? tr("Usá al menos 8 caracteres.")
                  : undefined
              }
              secureTextEntry={name === "password"}
              textContentType={
                name === "password"
                  ? "newPassword"
                  : name === "email"
                    ? "emailAddress"
                    : "username"
              }
              error={fieldState.error?.message}
            />
          )}
        />
      ))}
      {mutation.error && (
        <ErrorMessage message={normalizeError(mutation.error).message} />
      )}
    </AuthSheet>
  );
}
export function Login() {
  useLocale();
  return <LoginForm />;
}
export function Registration() {
  useLocale();
  return <RegistrationForm />;
}
export function Profile() {
  const theme = useTheme();
  useLocale();
  const { user } = useSession();
  if (user) return <ProfileJourney />;
  return (
    <Page safeTop tabBarClearance>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title>{tr("Perfil")}</Title>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Ajustes")}
          testID="profile-settings"
          onPress={() => router.push("/ajustes")}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: theme.colors.hero,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="settings" color={theme.colors.onDark} size={23} />
        </Pressable>
      </View>
      <RequireSession bare />
    </Page>
  );
}
function ProfileForm({ user }: { user: Account }) {
  const theme = useTheme();
  useLocale();
  const session = useSession(),
    online = useCanWrite();
  const client = useQueryClient();
  const form = useForm<
    z.input<typeof profileSchema>,
    unknown,
    z.output<typeof profileSchema>
  >({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      country_code: user.country_code,
      is_private: user.is_private,
    },
  });
  const mutation = useMutation({
    mutationFn: (values: z.output<typeof profileSchema>) =>
      write<Account>("auth/me/", "PATCH", values),
    onSuccess: async (updated) => {
      await session.reload();
      await client.invalidateQueries({ queryKey: ["private", "social"] });
      client.removeQueries({
        predicate: (q) =>
          q.queryKey[0] === "public" &&
          typeof q.queryKey[1] === "string" &&
          [user.username, updated.username].some((username) =>
            (q.queryKey[1] as string).startsWith(
              `profiles/${encodeURIComponent(username)}/`,
            ),
          ),
      });
      router.back();
    },
    onError: (error) => {
      const fields = normalizeError(error).fields;
      for (const key of ["username", "display_name", "country_code"] as const) {
        if (fields[key]?.length)
          form.setError(key, {
            type: "server",
            message: fields[key].join(" "),
          });
      }
    },
  });
  const saveError = mutation.error ? normalizeError(mutation.error) : null;
  return (
    <>
      <Controller
        control={form.control}
        name="username"
        render={({ field, fieldState }) => (
          <Field
            label={tr("Usuario")}
            testID="profile-username"
            value={field.value}
            onChangeText={(value) => {
              field.onChange(value);
              if (fieldState.error?.type === "server")
                form.clearErrors("username");
            }}
            onBlur={field.onBlur}
            inputRef={field.ref}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            maxLength={150}
            editable={!mutation.isPending}
            error={fieldState.error?.message}
          />
        )}
      />
      <Body muted>
        {tr(
          "Podés cambiar tu usuario. Comprobaremos que esté disponible al guardar.",
        )}
      </Body>
      <Controller
        control={form.control}
        name="display_name"
        render={({ field, fieldState }) => (
          <Field
            label={tr("Nombre para mostrar")}
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="bio"
        render={({ field }) => (
          <Field
            label={tr("Sobre vos")}
            value={field.value}
            onChangeText={field.onChange}
            multiline
          />
        )}
      />
      <Controller
        control={form.control}
        name="country_code"
        render={({ field, fieldState }) => (
          <ProfileSelect
            label={tr("País")}
            icon="globe"
            value={field.value}
            options={profileCountries}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={mutation.isPending}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="is_private"
        render={({ field }) => (
          <Host
            matchContents
            seedColor={theme.colors.green}
            colorScheme={theme.dark ? "dark" : "light"}
          >
            <Switch
              label={tr("Perfil privado")}
              value={field.value}
              onValueChange={field.onChange}
            />
          </Host>
        )}
      />
      <Body muted>
        {tr("En un perfil privado solo se muestran tu usuario y tu nombre.")}
      </Body>
      {saveError &&
        !["username", "display_name", "country_code"].some(
          (key) => saveError.fields[key]?.length,
        ) && <ErrorMessage message={saveError.message} />}
      <Button
        label={mutation.isPending ? tr("Guardando…") : tr("Guardar cambios")}
        disabled={!online || mutation.isPending}
        onPress={form.handleSubmit((values) => mutation.mutate(values))}
      />
      <Button
        label={tr("Cancelar")}
        secondary
        disabled={mutation.isPending}
        onPress={() => router.back()}
      />
    </>
  );
}
export function EditProfile() {
  useLocale();
  const { user } = useSession();
  return (
    <Page>
      <RequireSession>{user && <ProfileForm user={user} />}</RequireSession>
    </Page>
  );
}
