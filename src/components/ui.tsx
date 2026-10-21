import { tr, useLocale, getLocale } from "@/i18n";
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
export const TAB_BAR_CONTENT_CLEARANCE = 112;
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
  useLocale();
  return (
    <Text selectable style={muted ? styles.muted : styles.body}>
      {children}
    </Text>
  );
}
export function Title({ children }: React.PropsWithChildren) {
  useLocale();
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
  tabBarClearance = false,
}: React.PropsWithChildren<{
  fullBleed?: boolean;
  safeTop?: boolean;
  tabBarClearance?: boolean;
}>) {
  useLocale();
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
            tabBarClearance && {
              paddingBottom: TAB_BAR_CONTENT_CLEARANCE,
            },
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
  useLocale();
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
  accessibilityLabel,
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
  accessibilityLabel?: string;
}) {
  useLocale();
  const filled = (!secondary || selected) && !destructive;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
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
  useLocale();
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
  useLocale();
  return (
    <Text
      selectable
      accessibilityRole="alert"
      style={[styles.body, { color: t.colors.error }]}
    >
      {tr(message)}
    </Text>
  );
}
export function OfflineBanner() {
  useLocale();
  const net = useNetInfo();
  return net.isConnected === false || net.isInternetReachable === false ? (
    <Card>
      <Body>{tr("Sin conexión. Mostramos la información guardada.")}</Body>
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
  useLocale();
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
              label={tr("Reintentar")}
              onPress={() => {
                void query.refetch();
              }}
            />
          </>
        ) : (
          <Body>
            {tr("Conectate para cargar esta información por primera vez.")}
          </Body>
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
  useLocale();
  return (
    <>
      {query.error && (
        <Card>
          <ErrorMessage
            message={tr(
              "No pudimos actualizar. Mostramos los datos guardados.",
            )}
          />
          <Button
            label={tr("Reintentar")}
            secondary
            onPress={() => {
              void query.refetch();
            }}
          />
        </Card>
      )}
      {empty ? (
        <EmptyState
          title={tr("No encontramos yerbas")}
          description={tr(
            "Probá con otras palabras o ajustá los filtros para seguir explorando.",
          )}
        />
      ) : (
        children
      )}
    </>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  useLocale();
  return (
    <View
      accessibilityRole="summary"
      style={{
        alignItems: "center",
        paddingHorizontal: t.spacing.md,
        paddingVertical: t.spacing.lg,
        gap: t.spacing.sm,
      }}
    >
      <Image
        source={require("../../assets/images/mate-botanical.webp")}
        style={{ width: 224, height: 142, marginBottom: t.spacing.xs }}
        contentFit="contain"
        accessible={false}
      />
      <View style={{ alignItems: "center", gap: t.spacing.sm, maxWidth: 320 }}>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: t.fonts.display,
            fontSize: 25,
            lineHeight: 29,
            textTransform: "uppercase",
            color: t.colors.ink,
            textAlign: "center",
          }}
        >
          {title}
        </Text>
        <Text
          selectable
          style={[styles.body, { textAlign: "center", color: t.colors.muted }]}
        >
          {description}
        </Text>
      </View>
      {action}
    </View>
  );
}
export function RequireSession({
  children,
  bare = false,
}: React.PropsWithChildren<{ bare?: boolean }>) {
  useLocale();
  const session = useSession();
  if (!session.user) {
    const content = (
      <View style={{ gap: t.spacing.sm }}>
        <Title>{tr("Tu ronda empieza acá")}</Title>
        <Body>
          {tr(
            "Ingresá para guardar yerbas, compartir opiniones y armar tu biblioteca.",
          )}
        </Body>
        {session.error && (
          <>
            <ErrorMessage message={session.error} />
            <Button
              label={tr("Restaurar sesión")}
              onPress={() => {
                void session.restore();
              }}
            />
          </>
        )}
        <Button
          label={tr("Ingresar")}
          onPress={() => router.push("/ingresar")}
        />
        <Button
          label={tr("Crear cuenta")}
          secondary
          onPress={() => router.push("/registro")}
        />
      </View>
    );
    return bare ? content : <Card>{content}</Card>;
  }
  return <>{children}</>;
}
export async function openExternal(url: string) {
  if (/^https?:\/\//i.test(url)) await Linking.openURL(url);
}
export function ExternalLink({
  label,
  url,
  textLink = false,
}: {
  label: string;
  url: string;
  textLink?: boolean;
}) {
  useLocale();
  const [error, setError] = React.useState(false);
  const open = () => {
    setError(false);
    void openExternal(url).catch(() => setError(true));
  };

  if (textLink) {
    return (
      <>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={label}
          accessibilityHint={tr("Abre el sitio de la fuente")}
          onPress={open}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: t.spacing.sm,
            minHeight: 44,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: t.fonts.bold,
              fontSize: 15,
              color: t.colors.green,
            }}
          >
            {label}
          </Text>
          <Icon name="arrow" size={16} />
        </Pressable>
        {error && <ErrorMessage message={tr("No pudimos abrir el enlace.")} />}
      </>
    );
  }

  return (
    <>
      <Button
        secondary
        label={label}
        onPress={open}
      />
      {error && <ErrorMessage message={tr("No pudimos abrir el enlace.")} />}
    </>
  );
}
export function YerbaCard({
  yerba,
  badge,
  index = 0,
  loading = false,
}: {
  index?: number;
  loading?: boolean;
  badge?: { text: string; accessibilityLabel: string };
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
  useLocale();
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
      Alert.alert(
        tr("No pudimos guardar la yerba"),
        normalizeError(error).message,
      ),
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
          accessibilityLabel={`${badge ? `${badge.accessibilityLabel}. ` : ""}${tr(
            "Ver {0} {1}",
            {
              0: yerba.brand.name,
              1: yerba.name,
            },
          )}`}
          accessibilityHint={tr(
            "Mantené presionado para agregar o quitar de la comparación",
          )}
          onLongPress={() =>
            Alert.alert(yerba.name, tr("Comparación de yerbas"), [
              {
                text: selected
                  ? tr("Quitar de comparación")
                  : tr("Agregar a comparación"),
                onPress: () => comparison.toggle(yerba.slug),
              },
              ...(comparison.slugs.length
                ? [
                    {
                      text: tr("Ver comparación"),
                      onPress: () => router.push("/comparar"),
                    },
                  ]
                : []),
              { text: tr("Cancelar"), style: "cancel" },
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
                  {tr("Imagen no disponible")}
                </Text>
              </View>
            )}
          </View>
          <View style={{ width: "54%", padding: 16, paddingRight: 0, gap: 7 }}>
            {badge ? (
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: t.colors.green,
                  borderRadius: t.radius.pill,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontFamily: t.fonts.bold,
                    fontSize: 12,
                    lineHeight: 17,
                    color: t.colors.cream,
                  }}
                >
                  {badge.text}
                </Text>
              </View>
            ) : null}
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
                    ? `${rating.toLocaleString(getLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${yerba.stats.review_count} ${yerba.stats.review_count === 1 ? tr("opinión") : tr("opiniones")}`
                    : tr("Sin opiniones todavía")}
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
                  {yerba.styles.map((style) => tr(style.name)).join(" · ")}
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
                  {tr("Elaboración")}
                </Text>
                <CountryFlag
                  code={yerba.manufacturing_country_code}
                  country={countryLabel(yerba.manufacturing_country_code)}
                />
              </View>
            )}
            {yerba.is_discontinued && (
              <Text style={[styles.muted, { color: t.colors.amber }]}>
                {tr("Discontinuada")}
              </Text>
            )}
            {!!yerba.short_description && (
              <Text
                numberOfLines={3}
                style={[
                  styles.muted,
                  // The botanical image starts at 35% of the card. Keep the
                  // description inside that edge, while headings stay wider.
                  { fontSize: 12, maxWidth: "60%" },
                ]}
              >
                {yerba.short_description}
              </Text>
            )}
            {selected && (
              <Text style={[styles.muted, { fontFamily: t.fonts.bold }]}>
                {tr("En comparación")}
              </Text>
            )}
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr(
            favorite
              ? "Quitar {name} de favoritas"
              : "Guardar {name} en favoritas",
            { name: yerba.name },
          )}
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
                tr("No pudimos cargar tus favoritas"),
                tr("Volvé a intentarlo en un momento."),
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
  const names: Record<string, string> = {
    AR: "Argentina",
    UY: "Uruguay",
    PY: "Paraguay",
    BR: "Brasil",
    BO: "Bolivia",
    CL: "Chile",
    ES: "España",
    PT: "Portugal",
    GB: "Reino Unido",
  };
  const normalized = code.toUpperCase();
  if (Object.hasOwn(names, normalized)) return tr(names[normalized]);
  try {
    return typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames([getLocale()], { type: "region" }).of(
          normalized,
        ) || code
      : code;
  } catch {
    return code;
  }
}
