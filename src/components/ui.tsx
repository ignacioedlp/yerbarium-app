import { LeafRating } from "@/components/leaf-rating";
import {
  ContentLoadingTransition,
  type SkeletonVariant,
} from "./content-skeleton";
import { YerbaCardReveal, YerbaCardSkeletons } from "./yerba-card-loading";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { CountryFlag } from "./country-flag";
import { Icon } from "./icon";
import { Paper } from "./editorial";
import { router } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";
import { theme as t } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResource } from "@/hooks/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LibraryState } from "@/api/community-types";
import { normalizeError, write } from "@/api/client";
import { useSession } from "@/providers/session";
import type { YerbaMateListItem } from "@/api/types";
import { useComparison } from "@/providers/comparison";
export const styles = StyleSheet.create({
  page: {
    padding: t.spacing.lg,
    paddingBottom: t.spacing.section,
    gap: t.spacing.lg,
    flexGrow: 1,
  },
  body: {
    fontFamily: t.fonts.body,
    fontSize: t.type.body,
    lineHeight: 24,
    color: t.colors.ink,
  },
  title: {
    fontFamily: t.fonts.display,
    fontSize: t.type.title,
    lineHeight: 31,
    textTransform: "uppercase",
    color: t.colors.ink,
  },
  display: {
    fontFamily: t.fonts.display,
    fontSize: t.type.display,
    lineHeight: 48,
    textTransform: "uppercase",
    color: t.colors.ink,
  },
  muted: {
    fontFamily: t.fonts.body,
    fontSize: t.type.caption,
    lineHeight: 19,
    color: t.colors.muted,
  },
  card: {
    padding: t.spacing.md,
    gap: t.spacing.sm,
    backgroundColor: t.colors.surface,
    overflow: "hidden",
    borderRadius: t.radius.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: t.spacing.sm,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: t.spacing.md,
    paddingVertical: 12,
    borderRadius: t.radius.pill,
    backgroundColor: t.colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: t.fonts.bold,
    fontSize: 16,
    color: t.colors.cream,
  },
  input: {
    minHeight: 48,
    padding: t.spacing.md,
    backgroundColor: t.colors.cream,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.control,
    fontFamily: t.fonts.body,
    fontSize: 17,
    color: t.colors.ink,
  },
});
export function Body({
  children,
  muted = false,
}: React.PropsWithChildren<{ muted?: boolean }>) {
  return (
    <Text selectable style={muted ? styles.muted : styles.body}>
      {children}
    </Text>
  );
}
export function Title({ children }: React.PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}
export function Page({
  children,
  fullBleed = false,
  safeTop = false,
}: React.PropsWithChildren<{ fullBleed?: boolean; safeTop?: boolean }>) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Paper />
      <SafeAreaView edges={safeTop ? ["top"] : []} style={{ flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.page,
            fullBleed && { padding: 0, gap: 0 },
          ]}
        >
          <OfflineBanner />
          {children}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
export function Card({ children }: React.PropsWithChildren) {
  return (
    <View style={styles.card}>
      <Paper />
      {children}
    </View>
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
  destructive = false,
  fullWidth = false,
  selected,
  compact = false,
  selectedBackgroundColor = t.colors.selected,
  expanded,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  destructive?: boolean;
  fullWidth?: boolean;
  selected?: boolean;
  compact?: boolean;
  selectedBackgroundColor?: string;
  expanded?: boolean;
}) {
  const filled = (!secondary || selected) && !destructive;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected, expanded }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          flexDirection: "row",
          gap: t.spacing.sm,
          opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
          backgroundColor: filled
            ? selected
              ? selectedBackgroundColor
              : t.colors.green
            : "transparent",
          borderWidth: filled ? 0 : 1,
          borderColor: destructive ? t.colors.error : t.colors.border,
          alignSelf: fullWidth || !compact ? "stretch" : "flex-start",
          paddingHorizontal: compact ? 14 : 20,
        },
      ]}
    >
      {selected && <Icon name="check" size={15} color={t.colors.ink} />}
      <Text
        style={[
          styles.buttonText,
          {
            color: destructive
              ? t.colors.error
              : selected || !filled
                ? t.colors.ink
                : t.colors.cream,
            fontSize: compact ? 13 : 15,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Field({
  label,
  error,
  inputRef,
  ...props
}: TextInputProps & {
  label: string;
  error?: string;
  inputRef?: React.Ref<TextInput>;
}) {
  return (
    <View style={{ gap: t.spacing.xs }}>
      <Text
        style={[
          styles.muted,
          { fontFamily: t.fonts.bold, color: t.colors.ink },
        ]}
      >
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        placeholderTextColor={t.colors.muted}
        style={styles.input}
        {...props}
      />
      {error && <ErrorMessage message={error} />}
    </View>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return (
    <Text
      selectable
      accessibilityRole="alert"
      style={[styles.body, { color: t.colors.error }]}
    >
      {message}
    </Text>
  );
}
export function OfflineBanner() {
  const net = useNetInfo();
  return net.isConnected === false || net.isInternetReachable === false ? (
    <Card>
      <Body>Sin conexión. Mostramos la información guardada.</Body>
    </Card>
  ) : null;
}
export function useCanWrite() {
  const net = useNetInfo();
  return net.isConnected !== false && net.isInternetReachable !== false;
}
export function QueryState({
  query,
  empty,
  children,
  yerbaCards = false,
  skeleton = "content",
}: React.PropsWithChildren<{
  query: {
    data?: unknown;
    error: unknown;
    fetchStatus?: string;
    isFetchingNextPage?: boolean;
    refetch: () => unknown;
  };
  empty?: boolean;
  yerbaCards?: boolean;
  skeleton?: SkeletonVariant;
}>) {
  if (
    yerbaCards &&
    query.fetchStatus === "fetching" &&
    !query.isFetchingNextPage
  )
    return <YerbaCardSkeletons />;
  const loading =
    query.data === undefined && !query.error && query.fetchStatus !== "paused";
  if (loading && yerbaCards) return <YerbaCardSkeletons />;
  if (!yerbaCards && (loading || query.data !== undefined))
    return (
      <ContentLoadingTransition loading={loading} variant={skeleton}>
        <QueryContent query={query} empty={empty}>
          {children}
        </QueryContent>
      </ContentLoadingTransition>
    );
  if (query.data === undefined)
    return (
      <Card>
        {query.error ? (
          <>
            <ErrorMessage message={normalizeError(query.error).message} />
            <Button
              label="Reintentar"
              onPress={() => {
                void query.refetch();
              }}
            />
          </>
        ) : (
          <Body>Conectate para cargar esta información por primera vez.</Body>
        )}
      </Card>
    );
  return (
    <QueryContent query={query} empty={empty}>
      {children}
    </QueryContent>
  );
}

function QueryContent({
  query,
  empty,
  children,
}: React.PropsWithChildren<{
  query: { error: unknown; refetch: () => unknown };
  empty?: boolean;
}>) {
  return (
    <>
      {query.error && (
        <Card>
          <ErrorMessage message="No pudimos actualizar. Mostramos los datos guardados." />
          <Button
            label="Reintentar"
            secondary
            onPress={() => {
              void query.refetch();
            }}
          />
        </Card>
      )}
      {empty ? (
        <Card>
          <Title>No encontramos resultados</Title>
          <Body>Probá otra búsqueda o quitá los filtros.</Body>
        </Card>
      ) : (
        children
      )}
    </>
  );
}
export function RequireSession({ children }: React.PropsWithChildren) {
  const session = useSession();
  if (!session.user)
    return (
      <Card>
        <Title>Tu ronda empieza acá</Title>
        <Body>
          Ingresá para guardar yerbas, compartir opiniones y armar tu
          biblioteca.
        </Body>
        {session.error && (
          <>
            <ErrorMessage message={session.error} />
            <Button
              label="Restaurar sesión"
              onPress={() => {
                void session.restore();
              }}
            />
          </>
        )}
        <Button label="Ingresar" onPress={() => router.push("/ingresar")} />
        <Button
          label="Crear cuenta"
          secondary
          onPress={() => router.push("/registro")}
        />
      </Card>
    );
  return <>{children}</>;
}
export async function openExternal(url: string) {
  if (/^https?:\/\//i.test(url)) await Linking.openURL(url);
}
export function ExternalLink({ label, url }: { label: string; url: string }) {
  const [error, setError] = React.useState(false);
  return (
    <>
      <Button
        secondary
        label={label}
        onPress={() => {
          setError(false);
          void openExternal(url).catch(() => setError(true));
        }}
      />
      {error && <ErrorMessage message="No pudimos abrir el enlace." />}
    </>
  );
}
export function YerbaCard({
  yerba,
  index = 0,
  loading = false,
}: {
  index?: number;
  loading?: boolean;
  yerba: Pick<
    YerbaMateListItem,
    "slug" | "name" | "brand" | "images" | "short_description"
  > &
    Partial<
      Pick<
        YerbaMateListItem,
        "stats" | "is_discontinued" | "styles" | "manufacturing_country_code"
      >
    >;
}) {
  const comparison = useComparison();
  const { user } = useSession();
  const activeUser = React.useRef(user?.username);
  React.useEffect(() => {
    activeUser.current = user?.username;
  }, [user?.username]);
  const online = useCanWrite();
  const client = useQueryClient();
  const path = `auth/library/${encodeURIComponent(yerba.slug)}/`;
  const library = useResource<LibraryState>(path, true, !!user);
  const favorite = !!user && !!library.data?.is_favorite;
  const save = useMutation({
    mutationFn: async (account: string) => ({
      account,
      state: await write<LibraryState>(path, "PATCH", {
        is_favorite: !favorite,
      }),
    }),
    onSuccess: ({ state, account }) => {
      if (activeUser.current !== account) return;
      client.setQueryData(["private", path], state);
      void client.invalidateQueries({ queryKey: ["private", "auth/library/"] });
      void client.invalidateQueries({
        queryKey: ["private", "auth/library/summary/"],
      });
    },
    onError: (error) =>
      Alert.alert("No pudimos guardar la yerba", normalizeError(error).message),
  });
  const [failedUrl, setFailedUrl] = React.useState<string>();
  const image = yerba.images?.[0];
  const selected = comparison.slugs.includes(yerba.slug);
  const rating = Number(yerba.stats?.rating_average);
  const rated =
    !!yerba.stats?.review_count &&
    yerba.stats.rating_average !== null &&
    Number.isFinite(rating);
  return (
    <YerbaCardReveal index={index} loading={loading}>
      <View
        style={[
          styles.card,
          { padding: 0, backgroundColor: "#f8f4e5", borderColor: "#a8a477" },
        ]}
      >
        <Paper />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver ${yerba.brand.name} ${yerba.name}`}
          accessibilityHint="Mantené presionado para agregar o quitar de la comparación"
          onLongPress={() =>
            Alert.alert(yerba.name, "Comparación de yerbas", [
              {
                text: selected
                  ? "Quitar de comparación"
                  : "Agregar a comparación",
                onPress: () => comparison.toggle(yerba.slug),
              },
              ...(comparison.slugs.length
                ? [
                    {
                      text: "Ver comparación",
                      onPress: () => router.push("/comparar"),
                    },
                  ]
                : []),
              { text: "Cancelar", style: "cancel" },
            ])
          }
          onPress={() =>
            router.push({
              pathname: "/yerbas/[slug]",
              params: { slug: yerba.slug },
            })
          }
          style={({ pressed }) => ({
            minHeight: 244,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: "35%",
              right: 4,
              top: 12,
              bottom: 4,
            }}
          >
            <Image
              source={require("../../assets/images/background-card.webp")}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
              contentPosition="bottom"
              accessible={false}
            />
            {image && image.url !== failedUrl ? (
              <Image
                source={image.url}
                transition={180}
                accessibilityLabel={image.alt_text || yerba.name}
                contentFit="contain"
                contentPosition="bottom"
                style={{
                  position: "absolute",
                  left: "18%",
                  right: 8,
                  top: 30,
                  bottom: 8,
                }}
                onError={() => setFailedUrl(image.url)}
              />
            ) : (
              <View
                style={{
                  position: "absolute",
                  left: "22%",
                  right: 8,
                  top: 70,
                  bottom: 30,
                  backgroundColor: t.colors.background,
                  borderRadius: 6,
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Text style={[styles.title, { fontSize: 36 }]}>
                  {yerba.brand.name.slice(0, 2).toUpperCase()}
                </Text>
                <Text style={[styles.muted, { textAlign: "center" }]}>
                  Imagen no disponible
                </Text>
              </View>
            )}
          </View>
          <View style={{ width: "54%", padding: 16, paddingRight: 0, gap: 7 }}>
            <Text style={[styles.muted, { color: t.colors.ink }]}>
              {yerba.brand.name}
            </Text>
            <Text style={[styles.title, { fontSize: 24, lineHeight: 25 }]}>
              {yerba.name}
            </Text>
            {yerba.stats && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {rated && (
                  <LeafRating value={rating} size={12} showValue={false} />
                )}
                <Text style={[styles.muted, { flex: 1, fontSize: 12 }]}>
                  {rated
                    ? `${rating.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${yerba.stats.review_count} ${yerba.stats.review_count === 1 ? "opinión" : "opiniones"}`
                    : "Sin opiniones todavía"}
                </Text>
              </View>
            )}
            {!!yerba.styles?.length && (
              <View
                style={{
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  borderRadius: 16,
                  padding: 5,
                  paddingRight: 8,
                  backgroundColor: t.colors.styleBackground,
                }}
              >
                <Icon name="leaf" size={16} color="#455c26" />
                <Text
                  style={[
                    styles.muted,
                    {
                      flexShrink: 1,
                      fontFamily: t.fonts.bold,
                      fontSize: 12,
                      color: t.colors.ink,
                    },
                  ]}
                >
                  {yerba.styles.map((style) => style.name).join(" · ")}
                </Text>
              </View>
            )}
            {!!yerba.manufacturing_country_code && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Text style={[styles.muted, { fontSize: 12 }]}>
                  Elaboración
                </Text>
                <CountryFlag
                  code={yerba.manufacturing_country_code}
                  country={countryLabel(yerba.manufacturing_country_code)}
                />
              </View>
            )}
            {yerba.is_discontinued && (
              <Text style={[styles.muted, { color: t.colors.amber }]}>
                Discontinuada
              </Text>
            )}
            {!!yerba.short_description && (
              <Text numberOfLines={3} style={[styles.muted, { fontSize: 12 }]}>
                {yerba.short_description}
              </Text>
            )}
            {selected && (
              <Text style={[styles.muted, { fontFamily: t.fonts.bold }]}>
                En comparación
              </Text>
            )}
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${favorite ? "Quitar" : "Guardar"} ${yerba.name} ${favorite ? "de" : "en"} favoritas`}
          accessibilityState={{
            selected: favorite,
            disabled:
              save.isPending || (!!user && (!online || library.isFetching)),
          }}
          disabled={
            save.isPending || (!!user && (!online || library.isFetching))
          }
          onPress={() => {
            if (!user) {
              router.push("/ingresar");
              return;
            }
            if (!library.data) {
              void library.refetch();
              Alert.alert(
                "No pudimos cargar tus favoritas",
                "Volvé a intentarlo en un momento.",
              );
              return;
            }
            save.mutate(user.username);
          }}
          style={({ pressed }) => ({
            position: "absolute",
            top: 4,
            right: 4,
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed || save.isPending ? 0.5 : 1,
          })}
        >
          {save.isPending ? (
            <ActivityIndicator color={t.colors.green} />
          ) : (
            <Icon
              name={favorite ? "heartFilled" : "heart"}
              size={22}
              color={t.colors.muted}
            />
          )}
        </Pressable>
      </View>
    </YerbaCardReveal>
  );
}

export function countryLabel(code: string) {
  return (
    (
      {
        AR: "Argentina",
        UY: "Uruguay",
        PY: "Paraguay",
        BR: "Brasil",
      } as Record<string, string>
    )[code] || code
  );
}
