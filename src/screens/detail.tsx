import { ReviewLike } from "@/components/review-like";
import { tr, countLabel, useLocale, getLocale } from "@/i18n";
import { PurchaseOptions } from "@/components/purchase-options";
import { EditorialSourceLink } from "@/components/editorial-source-link";
import { LeafRating } from "@/components/leaf-rating";
import React from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { CatalogImage } from "@/components/catalog-image";
import { CountryFlag } from "@/components/country-flag";
import { useTheme } from "@/theme";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Page,
  Title,
  Body,
  Button,
  QueryState,
  ErrorMessage,
  ExternalLink,
  useCanWrite,
  useUIStyles,
  countryLabel,
} from "@/components/ui";
import { useResource, usePages } from "@/hooks/queries";
import { CommunityRanking, YerbaMateDetail } from "@/api/types";
import {
  LibraryState,
  libraryChanges,
  Review,
  sensoryLabels,
} from "@/api/community-types";
import { normalizeError, get, write } from "@/api/client";
import { packageTypeLabel, technicalRows } from "@/api/format";
import { useSession } from "@/providers/session";
import { Icon } from "@/components/icon";
import { AnimatedTabContent, AnimatedTabs } from "@/components/animated-tabs";
import { CommunitySafetyActions } from "@/components/community-safety-actions";

const DETAIL_TABS = {
  info: "Ficha",
  profile: "Perfil",
  reviews: "Opiniones",
  sources: "Fuentes",
} as const;
const TAB_OPTIONS = Object.entries(DETAIL_TABS).map(([key, label]) => ({
  key: key as keyof typeof DETAIL_TABS,
  label,
}));
export function Detail() {
  const theme = useTheme();
  const styles = useUIStyles();
  useLocale();
  const { width } = useWindowDimensions();
  const galleryWidth = Math.min(420, width - theme.spacing.lg * 2);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const path = `yerbas/${encodeURIComponent(slug)}/`;
  const { user, error: sessionError, restore } = useSession();
  const query = useResource<YerbaMateDetail>(path),
    reviews = usePages<Review>(`${path}reviews/`, {}, !!user),
    ranking = useResource<CommunityRanking>(
      "community/rankings/yerbas/?limit=3",
    );
  const [tab, setTab] = React.useState<
    "info" | "profile" | "reviews" | "sources"
  >("info");
  const [visibleReviews, setVisibleReviews] = React.useState(2);
  const [purchaseSlug, setPurchaseSlug] = React.useState<string | null>(null);
  const online = useCanWrite();
  const client = useQueryClient();
  const activeUser = React.useRef(user?.username);
  React.useLayoutEffect(() => {
    activeUser.current = user?.username;
  }, [user?.username]);
  const library = useResource<LibraryState>(
    `auth/library/${encodeURIComponent(slug)}/`,
    true,
    !!user,
  );
  const own = useQuery({
    queryKey: ["private", `${path}reviews/me/`],
    enabled: !!user,
    queryFn: async ({ signal }) => {
      try {
        return await get<Review>(`${path}reviews/me/`, undefined, signal, true);
      } catch (error) {
        if (normalizeError(error).status === 404) return null;
        throw error;
      }
    },
  });
  const mutation = useMutation({
    mutationFn: async (changes: Partial<LibraryState>) => ({
      account: user?.username,
      state: await write<LibraryState>(
        `auth/library/${encodeURIComponent(slug)}/`,
        "PATCH",
        changes,
      ),
    }),
    onSuccess: ({ account, state }) => {
      if (!account || activeUser.current !== account) return;
      void client.invalidateQueries({
        queryKey: ["private", "auth/me/gamification/"],
      });
      client.setQueryData(
        ["private", `auth/library/${encodeURIComponent(slug)}/`],
        state,
      );
      void client.invalidateQueries({ queryKey: ["private", "auth/library/"] });
      void client.invalidateQueries({
        queryKey: ["private", "auth/library/summary/"],
      });
      void library.refetch();
    },
  });
  const deletion = useMutation({
    mutationFn: () => write(`reviews/${own.data!.id}/`, "DELETE"),
    onSuccess: () => {
      void client.invalidateQueries({
        queryKey: ["private", "auth/me/gamification/"],
      });
      void client.invalidateQueries({ queryKey: ["private", "social"] });
      void client.invalidateQueries({ queryKey: ["public"] });
      void own.refetch();
    },
  });
  const yerba = query.data;
  const podiumRank = ranking.data?.results.find(
    (item) => item.slug === yerba?.slug && item.rank <= 3,
  )?.rank;
  const publicReviews = (
    reviews.data?.pages.flatMap((page) => page.results) ?? []
  ).filter((review) => review.id !== own.data?.id);
  const rows = technicalRows(yerba?.technical_profile ?? null).filter(
    ([, value]) => value !== tr("Sin información"),
  );
  return (
    <Page>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <Stack.Screen />
      <QueryState query={query} skeleton="detail">
        {yerba && (
          <>
            <View style={{ gap: theme.spacing.md }}>
              <View style={{ gap: theme.spacing.xs }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.sm,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: theme.spacing.sm,
                    }}
                  >
                    <Text
                      accessibilityRole="header"
                      selectable
                      style={{
                        fontFamily: theme.fonts.display,
                        fontSize: 34,
                        lineHeight: 37,
                        color: theme.colors.ink,
                      }}
                    >
                      {yerba.name.toUpperCase()}
                    </Text>
                    {podiumRank ? (
                      <View
                        accessibilityLabel={tr("Puesto {0}", {
                          0: podiumRank,
                        })}
                        style={{
                          minWidth: 30,
                          height: 30,
                          paddingHorizontal: theme.spacing.sm,
                          borderRadius: theme.radius.pill,
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor:
                            podiumRank === 1
                              ? theme.colors.podiumGold
                              : podiumRank === 2
                                ? theme.colors.podiumSilver
                                : theme.colors.podiumBronze,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.colors.white,
                            fontFamily: theme.fonts.display,
                            fontSize: 16,
                          }}
                        >
                          {podiumRank}º
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={tr(
                      library.data?.is_favorite
                        ? "Quitar {name} de favoritas"
                        : "Guardar {name} en favoritas",
                      { name: yerba.name },
                    )}
                    accessibilityHint={
                      !user
                        ? tr("Inicia sesión para guardar esta yerba")
                        : undefined
                    }
                    accessibilityState={{
                      selected: !!library.data?.is_favorite,
                      disabled:
                        mutation.isPending ||
                        (!!user && (!online || library.isFetching)),
                    }}
                    disabled={
                      mutation.isPending ||
                      (!!user && (!online || library.isFetching))
                    }
                    hitSlop={6}
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
                      mutation.mutate({
                        is_favorite: !library.data.is_favorite,
                      });
                    }}
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed || mutation.isPending ? 0.5 : 1,
                    })}
                  >
                    {mutation.isPending ? (
                      <ActivityIndicator color={theme.colors.green} />
                    ) : (
                      <Icon
                        name={
                          library.data?.is_favorite ? "heartFilled" : "heart"
                        }
                        size={25}
                        color={theme.colors.green}
                      />
                    )}
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={tr("Conocer la marca {0}", {
                    0: yerba.brand.name,
                  })}
                  onPress={() =>
                    router.push({
                      pathname: "/marcas/[slug]",
                      params: { slug: yerba.brand.slug },
                    })
                  }
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  <Text
                    style={{
                      fontFamily: theme.fonts.bold,
                      color: theme.colors.green,
                      fontSize: 17,
                    }}
                  >
                    {yerba.brand.name} {tr("· Ver marca")}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={tr("Ver opiniones de esta yerba")}
                  onPress={() => setTab("reviews")}
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  {yerba.stats.review_count > 0 &&
                  yerba.stats.rating_average !== null ? (
                    <View style={{ gap: theme.spacing.xs }}>
                      <LeafRating value={yerba.stats.rating_average} />
                      <Body muted>
                        {countLabel(
                          yerba.stats.review_count,
                          "{count} opinión",
                          "{count} opiniones",
                        )}
                      </Body>
                    </View>
                  ) : (
                    <Body>{tr("Todavía sin opiniones")}</Body>
                  )}
                </Pressable>
              </View>
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: theme.spacing.md }}
                  accessibilityLabel={tr("Galería de la yerba")}
                >
                  {(yerba.images.length ? yerba.images : [null]).map(
                    (image, index) => (
                      <View
                        key={image?.position ?? index}
                        style={{
                          width: galleryWidth,
                          height: 240,
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={require("../../assets/images/background-card.webp")}
                          style={{ position: "absolute", inset: 0 }}
                          contentFit="contain"
                          contentPosition="bottom"
                          accessible={false}
                        />
                        {image ? (
                          <View style={{ width: "56%", alignSelf: "center" }}>
                            <CatalogImage
                              url={image.url}
                              label={image.alt_text || yerba.name}
                              height={220}
                            />
                          </View>
                        ) : (
                          <Text
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              backgroundColor: theme.colors.background,
                              padding: theme.spacing.xs,
                              color: theme.colors.muted,
                              fontFamily: theme.fonts.body,
                              fontSize: 12,
                            }}
                          >
                            {tr("Imagen de producto no disponible")}
                          </Text>
                        )}
                      </View>
                    ),
                  )}
                </ScrollView>
              </View>
              {yerba.short_description && (
                <Body>{yerba.short_description}</Body>
              )}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.md,
                }}
              >
                <SummaryFact
                  label={tr("Elaboración")}
                  countryCode={yerba.manufacturing_country_code}
                  value={
                    yerba.manufacturing_country_code
                      ? countryLabel(yerba.manufacturing_country_code)
                      : tr("No informada")
                  }
                />
                <SummaryFact
                  label={tr("Tradición")}
                  countryCode={yerba.tradition_country_code}
                  value={
                    yerba.tradition_country_code
                      ? countryLabel(yerba.tradition_country_code)
                      : tr("No informada")
                  }
                />
                {yerba.styles.length > 0 && (
                  <SummaryFact
                    label={tr("Estilo")}
                    value={yerba.styles
                      .map((style) => tr(style.name))
                      .join(" · ")}
                  />
                )}
              </View>
              {yerba.is_discontinued && (
                <Body muted>{tr("Producto discontinuado")}</Body>
              )}
              <View style={{ gap: theme.spacing.sm }}>
                {(user || !!yerba.purchase_links?.length) && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "nowrap",
                      alignItems: "center",
                      gap: theme.spacing.xs,
                    }}
                  >
                    {user && (
                      <QueryState query={library}>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "nowrap",
                            alignItems: "center",
                            gap: theme.spacing.xs,
                          }}
                        >
                          {(["is_tried", "wants_to_try"] as const).map(
                            (key) => (
                              <Button
                                key={key}
                                compact
                                label={
                                  key === "is_tried"
                                    ? tr("Probada")
                                    : tr("Quiero probar")
                                }
                                secondary={!library.data?.[key]}
                                selected={library.data?.[key]}
                                disabled={mutation.isPending || !online}
                                onPress={() =>
                                  mutation.mutate(
                                    libraryChanges(key, !library.data?.[key]),
                                  )
                                }
                              />
                            ),
                          )}
                        </View>
                      </QueryState>
                    )}
                    {!!yerba.purchase_links?.length && (
                      <Button
                        compact
                        label={tr("Comprar")}
                        expanded={purchaseSlug === slug}
                        onPress={() =>
                          setPurchaseSlug(purchaseSlug === slug ? null : slug)
                        }
                      />
                    )}
                  </View>
                )}
                {user && mutation.error && (
                  <ErrorMessage
                    message={normalizeError(mutation.error).message}
                  />
                )}
                {!user && sessionError && (
                  <>
                    <ErrorMessage message={sessionError} />
                    <Button
                      compact
                      label={tr("Restaurar sesión")}
                      onPress={() => {
                        void restore();
                      }}
                    />
                  </>
                )}
                {purchaseSlug === slug && !!yerba.purchase_links?.length && (
                  <PurchaseOptions
                    key={slug}
                    slug={slug}
                    links={yerba.purchase_links}
                  />
                )}
              </View>
            </View>
            <View style={{ gap: theme.spacing.md }}>
              <AnimatedTabs
                options={TAB_OPTIONS}
                selected={tab}
                onSelect={setTab}
              />
              <AnimatedTabContent activeKey={tab}>
                {tab === "info" && (
                  <View style={{ gap: theme.spacing.md }}>
                    <Title>{tr("Sobre esta yerba")}</Title>
                    <Body>
                      {yerba.description ||
                        yerba.short_description ||
                        tr("Todavía no hay una descripción publicada.")}
                    </Body>
                    {yerba.presentations.length > 0 && (
                      <>
                        <SectionHeading>{tr("Presentaciones")}</SectionHeading>
                        {yerba.presentations.map((item, index) => (
                          <DetailRow
                            key={index}
                            label={`${item.weight_grams} g`}
                            value={`${packageTypeLabel(item.package_type)}${item.barcode ? ` · ${item.barcode}` : ""}`}
                          />
                        ))}
                      </>
                    )}
                    {!!yerba.presentation_availability?.length && (
                      <>
                        <SectionHeading>
                          {tr("Disponibilidad documentada")}
                        </SectionHeading>
                        {yerba.presentation_availability.map((item) => (
                          <View
                            key={item.weight_grams}
                            style={{ gap: theme.spacing.xs }}
                          >
                            <DetailRow
                              label={`${item.weight_grams} g`}
                              value={
                                {
                                  AVAILABLE: tr("Disponible"),
                                  UNAVAILABLE: tr("No disponible"),
                                  UNKNOWN: tr("Sin confirmar"),
                                }[item.status]
                              }
                            />
                            {item.verified_at && (
                              <Body muted>
                                {tr("Verificado: {date}", {
                                  date: new Date(
                                    item.verified_at,
                                  ).toLocaleDateString(getLocale()),
                                })}
                              </Body>
                            )}
                            {item.source && (
                              <ExternalLink
                                label={item.source.title}
                                url={item.source.url}
                                textLink
                              />
                            )}
                          </View>
                        ))}
                      </>
                    )}
                  </View>
                )}
                {tab === "profile" && (
                  <View style={{ gap: theme.spacing.md }}>
                    <Title>{tr("Perfil técnico")}</Title>
                    {rows.length ? (
                      rows.map(([label, value]) => (
                        <DetailRow key={label} label={label} value={value} />
                      ))
                    ) : (
                      <Body muted>
                        {tr(
                          "No hay datos técnicos publicados para esta yerba.",
                        )}
                      </Body>
                    )}
                    <SectionHeading>
                      {tr("Perfil de la comunidad")}
                    </SectionHeading>
                    <Body muted>
                      {tr("Promedios de la ronda, desde")}{" "}
                      {countLabel(
                        yerba.sensory_profile.minimum_evaluators,
                        "{count} evaluador",
                        "{count} evaluadores",
                      )}
                      .
                    </Body>
                    {yerba.sensory_profile.attributes
                      .filter(
                        (attribute) =>
                          attribute.has_sufficient_evidence &&
                          attribute.average !== null,
                      )
                      .map((attribute) => (
                        <View
                          key={attribute.attribute}
                          style={{ gap: theme.spacing.xs }}
                        >
                          <Text
                            accessibilityRole="header"
                            style={{
                              fontFamily: theme.fonts.bold,
                              fontSize: 20,
                              lineHeight: 26,
                              color: theme.colors.ink,
                            }}
                          >
                            {tr(sensoryLabels[attribute.attribute])}
                          </Text>
                          <LeafRating
                            fullWidth
                            size={30}
                            value={attribute.average}
                            label={tr(sensoryLabels[attribute.attribute])}
                          />
                          <Body muted>
                            {countLabel(
                              attribute.evaluator_count,
                              "{count} evaluador",
                              "{count} evaluadores",
                            )}
                          </Body>
                        </View>
                      ))}
                    {yerba.sensory_profile.attributes.some(
                      (attribute) => !attribute.has_sufficient_evidence,
                    ) && (
                      <Body muted>
                        {tr(
                          "Algunos atributos todavía no reúnen suficientes evaluaciones.",
                        )}
                      </Body>
                    )}
                    {yerba.sensory_profile.attributes.length === 0 && (
                      <Body muted>
                        {tr("Todavía no hay evaluaciones sensoriales.")}
                      </Body>
                    )}
                  </View>
                )}
                {tab === "reviews" && (
                  <View style={{ gap: theme.spacing.md }}>
                    <Title>{tr("Opiniones de la ronda")}</Title>
                    {user ? (
                      <QueryState query={own}>
                        {own.data && (
                          <>
                            <DetailReview review={own.data} />
                            <Body muted>
                              {tr("Tu opinión:")}{" "}
                              {
                                {
                                  PUBLISHED: tr("Publicada"),
                                  PENDING: tr("Pendiente de moderación"),
                                  HIDDEN: tr("Oculta"),
                                }[own.data.status]
                              }
                            </Body>
                          </>
                        )}
                        <View style={styles.row}>
                          <Button
                            compact
                            label={
                              own.data
                                ? tr("Editar mi opinión")
                                : tr("Compartir mi opinión")
                            }
                            disabled={!online}
                            onPress={() =>
                              router.push({
                                pathname: "/opinion/[slug]",
                                params: { slug },
                              })
                            }
                          />
                          {own.data && (
                            <Button
                              compact
                              secondary
                              label={tr("Borrar mi opinión")}
                              disabled={deletion.isPending || !online}
                              onPress={() =>
                                Alert.alert(
                                  tr("¿Borrar tu opinión?"),
                                  tr("Podés publicar una nueva después."),
                                  [
                                    { text: tr("Cancelar"), style: "cancel" },
                                    {
                                      text: tr("Borrar"),
                                      style: "destructive",
                                      onPress: () => deletion.mutate(),
                                    },
                                  ],
                                )
                              }
                            />
                          )}
                        </View>
                        {deletion.error && (
                          <ErrorMessage
                            message={normalizeError(deletion.error).message}
                          />
                        )}
                      </QueryState>
                    ) : (
                      <Button
                        compact
                        secondary
                        label={tr("Ingresar para opinar")}
                        onPress={() => router.push("/ingresar")}
                      />
                    )}
                    <QueryState query={reviews}>
                      {!publicReviews.length && !own.data && (
                        <Body muted>
                          {tr(
                            "Todavía no hay opiniones. Podés compartir la primera.",
                          )}
                        </Body>
                      )}
                      {publicReviews.slice(0, visibleReviews).map((review) => (
                        <DetailReview key={review.id} review={review} />
                      ))}
                    </QueryState>
                    {(publicReviews.length > visibleReviews ||
                      reviews.hasNextPage) && (
                      <Button
                        compact
                        secondary
                        label={tr("Ver más opiniones")}
                        disabled={reviews.isFetchingNextPage}
                        onPress={() => {
                          setVisibleReviews((count) => count + 3);
                          if (
                            publicReviews.length <= visibleReviews &&
                            reviews.hasNextPage
                          )
                            void reviews.fetchNextPage();
                        }}
                      />
                    )}
                  </View>
                )}
                {tab === "sources" && (
                  <View style={{ gap: theme.spacing.md }}>
                    <Title>{tr("Procedencia de la información")}</Title>
                    {!yerba.sources.length && (
                      <Body muted>
                        {tr(
                          "Todavía no hay fuentes documentadas para esta yerba.",
                        )}
                      </Body>
                    )}
                    {yerba.sources.map((source, index) => (
                      <EditorialSourceLink
                        key={index}
                        name={source.title || source.publisher}
                        publisher={source.publisher}
                        href={source.url}
                        note={tr("{0}Consultado {1}", {
                          0: source.is_official ? "Fuente oficial · " : "",
                          1: source.accessed_at,
                        })}
                      />
                    ))}
                    {yerba.images.some((image) => image.attribution) && (
                      <SectionHeading>
                        {tr("Créditos de imágenes")}
                      </SectionHeading>
                    )}
                    {yerba.images.map(
                      (image) =>
                        image.attribution && (
                          <View
                            key={image.position}
                            style={{ gap: theme.spacing.xs }}
                          >
                            <Body muted>
                              {image.attribution.text}
                              {image.attribution.change_note
                                ? ` · ${image.attribution.change_note}`
                                : ""}
                            </Body>
                            <ExternalLink
                              label={tr("Fuente de imagen")}
                              url={image.attribution.source_url}
                            />
                            <ExternalLink
                              label={tr("Licencia {0}", {
                                0: image.attribution.license_code,
                              })}
                              url={image.attribution.license_url}
                            />
                          </View>
                        ),
                    )}
                  </View>
                )}
              </AnimatedTabContent>
            </View>
          </>
        )}
      </QueryState>
    </Page>
  );
}

function SummaryFact({
  label,
  value,
  countryCode,
}: {
  label: string;
  value: string;
  countryCode?: string;
}) {
  const theme = useTheme();
  useLocale();
  const showFlag =
    !!countryCode &&
    ["AR", "BR", "PY", "UY"].includes(countryCode.toUpperCase());
  return (
    <View
      accessible={showFlag}
      accessibilityLabel={showFlag ? `${label}: ${value}` : undefined}
      style={{ gap: theme.spacing.xs, flex: 1, minWidth: 88 }}
    >
      <Text
        style={{
          color: theme.colors.muted,
          fontFamily: theme.fonts.body,
          fontSize: 13,
        }}
      >
        {tr(label)}
      </Text>
      {showFlag ? (
        <View style={{ minHeight: 19, justifyContent: "center" }}>
          <CountryFlag code={countryCode!} country={value} />
        </View>
      ) : (
        <Text
          selectable
          style={{
            color: theme.colors.ink,
            fontFamily: theme.fonts.bold,
            fontSize: 15,
          }}
        >
          {value}
        </Text>
      )}
    </View>
  );
}
function SectionHeading({ children }: React.PropsWithChildren) {
  const theme = useTheme();
  useLocale();
  return (
    <Text
      accessibilityRole="header"
      style={{
        paddingTop: theme.spacing.md,
        color: theme.colors.ink,
        fontFamily: theme.fonts.bold,
        fontSize: 20,
      }}
    >
      {children}
    </Text>
  );
}
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const theme = useTheme();
  useLocale();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderColor: theme.colors.subtleBorder,
      }}
    >
      <Text
        style={{
          flex: 1,
          color: theme.colors.muted,
          fontFamily: theme.fonts.body,
          fontSize: 14,
        }}
      >
        {tr(label)}
      </Text>
      {typeof value === "string" ? (
        <Text
          selectable
          style={{
            flex: 1,
            color: theme.colors.ink,
            fontFamily: theme.fonts.bold,
            fontSize: 15,
          }}
        >
          {value}
        </Text>
      ) : (
        <View style={{ flex: 1 }}>{value}</View>
      )}
    </View>
  );
}
function DetailReview({ review }: { review: Review }) {
  const theme = useTheme();
  useLocale();
  const [expanded, setExpanded] = React.useState(false);
  const sensory = Object.entries(review.sensory ?? {}).filter(
    ([, value]) => value !== null,
  );
  return (
    <View
      style={{
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: theme.spacing.sm,
        }}
      >
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={tr("Ver perfil de {0}", { 0: review.username })}
          onPress={() =>
            router.push({
              pathname: "/usuarios/[username]",
              params: { username: review.username },
            })
          }
          style={{ flex: 1, minHeight: 44, justifyContent: "center" }}
        >
          <Text
            style={{
              color: theme.colors.green,
              fontFamily: theme.fonts.bold,
              fontSize: 15,
            }}
          >
            @{review.username}
          </Text>
        </Pressable>
        <LeafRating value={review.rating} size={16} />
        <CommunitySafetyActions
          username={review.username}
          reviewId={review.id}
        />
      </View>
      <ReviewLike
        key={`${review.id}-${review.liked_by_me}-${review.likes_count}`}
        review={review}
      />
      {review.comment && <Body>{review.comment}</Body>}
      {review.flavor_notes.length > 0 && (
        <Body muted>
          {review.flavor_notes.map((note) => tr(note.name)).join(" · ")}
        </Body>
      )}
      <Body muted>
        {new Date(review.created_at).toLocaleDateString(getLocale())}
      </Body>
      {sensory.length > 0 && (
        <Button
          compact
          secondary
          label={
            expanded ? tr("Ocultar evaluación") : tr("Ver evaluación sensorial")
          }
          onPress={() => setExpanded(!expanded)}
        />
      )}
      {expanded &&
        sensory.map(([key, value]) => (
          <DetailRow
            key={key}
            label={tr(sensoryLabels[key as keyof typeof sensoryLabels])}
            value={
              <LeafRating
                value={value!}
                label={tr(sensoryLabels[key as keyof typeof sensoryLabels])}
                size={16}
              />
            }
          />
        ))}
    </View>
  );
}
