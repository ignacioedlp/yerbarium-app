import { learningLinks } from "@/content/learning";
import { AuthField, AuthSheet, AuthSwitch } from "@/components/auth-sheet";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { HandNote } from "@/components/editorial";
import { Icon } from "@/components/icon";
import { router, type Href } from "expo-router";
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
import { Host, Switch } from "@expo/ui";
import { theme } from "@/theme";
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
  return (
    <AuthSheet
      title="Bienvenido de nuevo"
      description="Ingresá con tu usuario o email."
      pending={mutation.isPending}
      actions={
        <>
          <Button
            label={mutation.isPending ? "Ingresando…" : "Ingresar"}
            disabled={mutation.isPending || !online}
            onPress={form.handleSubmit((values) => mutation.mutate(values))}
          />
          <AuthSwitch register={false} pending={mutation.isPending} />
        </>
      }
    >
      {(["identifier", "password"] as const).map((name) => (
        <Controller
          key={name}
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <AuthField
              label={name === "identifier" ? "Usuario o email" : "Contraseña"}
              defaultValue=""
              editable={!mutation.isPending}
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
                else if (online && !mutation.isPending)
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
      session.login("register", values),
    onSuccess: () => router.back(),
    onError: (error) => {
      for (const [key, messages] of Object.entries(
        normalizeError(error).fields,
      ))
        if (key === "username" || key === "email" || key === "password")
          form.setError(key, { message: messages.join(" ") });
    },
  });
  return (
    <AuthSheet
      title="Sumate a Yerbarium"
      description="Guardá tus yerbas y compartí lo que descubrís."
      pending={mutation.isPending}
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
            Al crear una cuenta, aceptás los{" "}
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
              Términos y Condiciones
            </Text>
            . Consultá la{" "}
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
              Política de privacidad
            </Text>
            .
          </Text>
          {legalLinkError && (
            <ErrorMessage message="No pudimos abrir el enlace legal." />
          )}
          <Button
            label={mutation.isPending ? "Creando cuenta…" : "Crear cuenta"}
            disabled={!online || mutation.isPending}
            onPress={form.handleSubmit((values) => mutation.mutate(values))}
          />
          <AuthSwitch register pending={mutation.isPending} />
        </>
      }
    >
      {(["username", "email", "password"] as const).map((name) => (
        <Controller
          key={name}
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <AuthField
              label={
                { username: "Usuario", email: "Email", password: "Contraseña" }[
                  name
                ]
              }
              defaultValue=""
              editable={!mutation.isPending}
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
                else if (online && !mutation.isPending)
                  void form.handleSubmit((values) => mutation.mutate(values))();
              }}
              keyboardType={name === "email" ? "email-address" : "default"}
              hint={
                name === "password" ? "Usá al menos 8 caracteres." : undefined
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
  return <LoginForm />;
}
export function Registration() {
  return <RegistrationForm />;
}
export function Profile() {
  const session = useSession();
  return (
    <Page safeTop>
      <Title>Perfil</Title>
      <RequireSession>
        <View style={{ gap: theme.spacing.sm }}>
          <Title>{session.user?.display_name}</Title>
          <Body muted>@{session.user?.username}</Body>
          <HandNote rotate={false}>
            {session.user?.bio || "Contá un poco sobre vos y tu ronda."}
          </HandNote>
        </View>
        <View style={{ gap: theme.spacing.sm }}>
          <Button
            label="Editar perfil"
            onPress={() => router.push("/editar-perfil")}
          />
          <Button
            label="Ver perfil público"
            secondary
            fullWidth
            onPress={() =>
              router.push({
                pathname: "/usuarios/[username]",
                params: { username: session.user!.username },
              })
            }
          />
        </View>
      </RequireSession>
      <View style={{ gap: theme.spacing.sm }}>
        <Title>Aprende</Title>
        <Body>
          Un catálogo y una comunidad para conocer mejor la yerba mate.
        </Body>
        <View style={{ borderTopWidth: 1, borderColor: theme.colors.border }}>
          {learningLinks.map(({ article, label }) => (
            <Pressable
              key={article}
              accessibilityRole="link"
              onPress={() =>
                router.push({
                  pathname: "/editorial/[article]",
                  params: { article },
                })
              }
              style={({ pressed }) => ({
                minHeight: 52,
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.sm,
                borderBottomWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Text
                style={{
                  flex: 1,
                  fontFamily: theme.fonts.bold,
                  fontSize: 16,
                  color: theme.colors.green,
                }}
              >
                {label}
              </Text>
              <Icon name="arrow" size={18} />
            </Pressable>
          ))}
        </View>
      </View>
      {session.user ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Button
            label="Cerrar sesión"
            secondary
            onPress={() => void session.logout()}
          />
          <Button
            label="Eliminar cuenta"
            secondary
            destructive
            onPress={() => router.push("/eliminar-cuenta" as Href)}
          />
        </View>
      ) : null}
    </Page>
  );
}
const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Ingresá tu nombre."),
  bio: z.string(),
  country_code: z
    .string()
    .trim()
    .regex(/^([a-zA-Z]{2})?$/, "Usá un código de país de dos letras.")
    .transform((value) => value.toUpperCase()),
  language_code: z.string().min(1),
  is_private: z.boolean(),
});
function ProfileForm({ user }: { user: Account }) {
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
      display_name: user.display_name,
      bio: user.bio,
      country_code: user.country_code,
      language_code: user.language_code || "es",
      is_private: user.is_private,
    },
  });
  const mutation = useMutation({
    mutationFn: (values: z.output<typeof profileSchema>) =>
      write<Account>("auth/me/", "PATCH", values),
    onSuccess: async () => {
      await session.reload();
      client.removeQueries({
        predicate: (q) =>
          q.queryKey[0] === "public" &&
          typeof q.queryKey[1] === "string" &&
          q.queryKey[1].startsWith(
            `profiles/${encodeURIComponent(user.username)}/`,
          ),
      });
      router.back();
    },
  });
  return (
    <>
      <Controller
        control={form.control}
        name="display_name"
        render={({ field, fieldState }) => (
          <Field
            label="Nombre para mostrar"
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
            label="Sobre vos"
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
          <Field
            label="País (AR, UY, PY, BR…)"
            value={field.value}
            onChangeText={field.onChange}
            autoCapitalize="characters"
            maxLength={2}
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
            colorScheme="light"
          >
            <Switch
              label="Perfil privado"
              value={field.value}
              onValueChange={field.onChange}
            />
          </Host>
        )}
      />
      <Body muted>
        En un perfil privado solo se muestran tu usuario y tu nombre.
      </Body>
      {mutation.error && (
        <ErrorMessage message={normalizeError(mutation.error).message} />
      )}
      <Button
        label={mutation.isPending ? "Guardando…" : "Guardar cambios"}
        disabled={!online || mutation.isPending}
        onPress={form.handleSubmit((values) => mutation.mutate(values))}
      />
      <Button
        label="Cancelar"
        secondary
        disabled={mutation.isPending}
        onPress={() => router.back()}
      />
    </>
  );
}
export function EditProfile() {
  const { user } = useSession();
  return (
    <Page>
      <RequireSession>{user && <ProfileForm user={user} />}</RequireSession>
    </Page>
  );
}
