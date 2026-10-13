import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { BottomSheet, Host, Picker, RNHostView } from "@expo/ui";
import {
  Title,
  Body,
  Button,
  Card,
  QueryState,
  YerbaCard,
  OfflineBanner,
  countryLabel,
  styles,
} from "@/components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { Paper, SearchBox } from "@/components/editorial";
import { CatalogMode } from "@/components/catalog-mode";
import { YerbaCardSkeletons } from "@/components/yerba-card-loading";
import { Icon } from "@/components/icon";
import { theme as t } from "@/theme";
import { usePages } from "@/hooks/queries";
import { BrandListItem, YerbaMateListItem, YerbaStyle } from "@/api/types";
import { useComparison } from "@/providers/comparison";
type Mode = "catalog" | "search" | "brands";
export function Explore() {
  const params = useLocalSearchParams<{
    style?: string;
    brand?: string;
    mode?: Mode;
  }>();
  return (
    <ExploreContent
      key={`${params.style || ""}:${params.brand || ""}:${params.mode || ""}`}
      initialStyle={params.style || ""}
      initialBrand={params.brand || ""}
      initialMode={params.mode || "catalog"}
    />
  );
}
function ExploreContent({
  initialStyle,
  initialBrand,
  initialMode,
}: {
  initialStyle: string;
  initialBrand: string;
  initialMode: Mode;
}) {
  const [mode, setMode] = useState<Mode>(
    ["catalog", "search", "brands"].includes(initialMode)
      ? initialMode === "search"
        ? "catalog"
        : initialMode
      : "catalog",
  );
  const [search, setSearch] = useState(""),
    [debounced, setDebounced] = useState("");
  const [style, setStyle] = useState(initialStyle),
    [brand, setBrand] = useState(initialBrand),
    [country, setCountry] = useState(""),
    [tradition, setTradition] = useState(""),
    [discontinued, setDiscontinued] = useState(""),
    [filters, setFilters] = useState(false);
  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(search.trim().slice(0, 150)),
      300,
    );
    return () => clearTimeout(timer);
  }, [search]);
  const yerbas = usePages<YerbaMateListItem>(
    mode === "search" ? "search/" : "yerbas/",
    mode === "search"
      ? { q: debounced }
      : {
          ...(style ? { style } : {}),
          ...(brand ? { brand } : {}),
          ...(country ? { manufacturing_country_code: country } : {}),
          ...(tradition ? { tradition_country_code: tradition } : {}),
          ...(discontinued ? { is_discontinued: discontinued } : {}),
        },
    false,
    mode !== "brands" && (mode !== "search" || !!debounced),
  );
  const brands = usePages<BrandListItem>("brands/");
  const taxonomy = usePages<YerbaStyle>("styles/");
  const comparison = useComparison();
  const activeFilters = [style, brand, country, tradition, discontinued].filter(
    Boolean,
  ).length;
  const header = (
    <View
      style={{
        paddingHorizontal: t.spacing.lg,
        paddingBottom: t.spacing.lg,
        gap: t.spacing.md,
      }}
    >
      {mode === "catalog" && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: t.spacing.sm }}
          >
            <Button
              label="Todos"
              compact
              secondary
              selected={!style}
              selectedBackgroundColor={t.colors.styleBackground}
              onPress={() => setStyle("")}
            />
            {taxonomy.data?.pages
              .flatMap((p) => p.results)
              .map((item) => (
                <Button
                  key={item.slug}
                  label={item.name}
                  compact
                  secondary
                  selected={style === item.slug}
                  selectedBackgroundColor={t.colors.styleBackground}
                  onPress={() => setStyle(item.slug)}
                />
              ))}
            {taxonomy.hasNextPage && (
              <Button
                label="Más estilos"
                compact
                secondary
                onPress={() => {
                  void taxonomy.fetchNextPage();
                }}
              />
            )}
          </ScrollView>
          {taxonomy.error && <QueryState query={taxonomy} />}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.muted}>
              {yerbas.data?.pages[0]?.count ?? "…"} yerbas en el catálogo
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir filtros"
              onPress={() => setFilters(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: t.spacing.sm,
                minHeight: 44,
              }}
            >
              <Icon name="filter" size={18} />
              <Text
                style={{
                  fontFamily: t.fonts.bold,
                  fontSize: 14,
                  color: t.colors.green,
                }}
              >
                Filtros{activeFilters ? ` (${activeFilters})` : ""}
              </Text>
            </Pressable>
          </View>
        </>
      )}
      {mode === "search" && debounced && (
        <View style={styles.row}>
          <Text style={styles.muted}>
            {yerbas.data?.pages[0]?.count ?? "…"} resultados para “{debounced}”
          </Text>
          <Button
            label="Volver al catálogo"
            compact
            secondary
            onPress={() => setMode("catalog")}
          />
        </View>
      )}
      {comparison.slugs.length > 0 && (
        <Button
          label={`Comparar ${comparison.slugs.length} yerbas`}
          onPress={() => router.push("/comparar")}
        />
      )}
    </View>
  );
  const items = yerbas.data?.pages.flatMap((p) => p.results) || [];
  const loadingYerbas =
    yerbas.fetchStatus === "fetching" && !yerbas.isFetchingNextPage;
  const brandItems: (BrandListItem | null)[] = [
    ...(brands.data?.pages.flatMap((p) => p.results) || []),
  ];
  if (brandItems.length % 2) brandItems.push(null);
  const showingBrands = mode === "brands";
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: t.colors.background }}
    >
      <Paper />
      <View
        style={{
          paddingHorizontal: t.spacing.lg,
          paddingTop: t.spacing.md,
          paddingBottom: t.spacing.md,
          gap: t.spacing.md,
        }}
      >
        <Text
          accessibilityRole="header"
          style={[
            styles.title,
            { fontSize: 34, lineHeight: 38, textTransform: "none" },
          ]}
        >
          Explorar
        </Text>
        <SearchBox
          autoFocus={initialMode === "search"}
          value={search}
          onChangeText={(value) => {
            setSearch(value);
            setMode(value.trim() ? "search" : "catalog");
          }}
        />
        <CatalogMode
          value={showingBrands ? "marcas" : "yerbas"}
          onChange={(value) =>
            setMode(
              value === "marcas"
                ? "brands"
                : search.trim()
                  ? "search"
                  : "catalog",
            )
          }
        />
        <OfflineBanner />
      </View>
      <View
        style={{ flex: 1, display: showingBrands ? "flex" : "none" }}
        accessibilityElementsHidden={!showingBrands}
        importantForAccessibility={
          showingBrands ? "auto" : "no-hide-descendants"
        }
      >
        <FlatList
          data={brandItems}
          numColumns={2}
          keyExtractor={(item) => item?.slug || "empty-brand-cell"}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={{
            paddingHorizontal: t.spacing.lg,
            gap: t.spacing.md,
          }}
          contentContainerStyle={{
            paddingTop: t.spacing.sm,
            paddingBottom: t.spacing.xl,
          }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, minWidth: 0 }}>
              {item && <BrandTile brand={item} />}
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: t.spacing.lg }} />
          )}
          ListEmptyComponent={
            <View style={{ padding: t.spacing.lg }}>
              <QueryState query={brands} empty />
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: t.spacing.lg, gap: t.spacing.md }}>
              {!!brandItems.length && brands.error && (
                <QueryState query={brands} />
              )}
              {brands.hasNextPage && (
                <Button
                  label="Más marcas"
                  disabled={brands.isFetchingNextPage}
                  onPress={() => {
                    void brands.fetchNextPage();
                  }}
                />
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              tintColor={t.colors.green}
              refreshing={brands.isRefetching}
              onRefresh={() => {
                void brands.refetch();
              }}
            />
          }
        />
      </View>
      <View
        style={{ flex: 1, display: showingBrands ? "none" : "flex" }}
        accessibilityElementsHidden={showingBrands}
        importantForAccessibility={
          showingBrands ? "no-hide-descendants" : "auto"
        }
      >
        <FlatList
          data={loadingYerbas ? [] : items}
          keyExtractor={(item) => item.slug}
          renderItem={({ item, index }) => (
            <View style={{ marginHorizontal: t.spacing.lg }}>
              <YerbaCard yerba={item} index={index % 20} />
            </View>
          )}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: t.spacing.xl }}
          ListHeaderComponent={header}
          ItemSeparatorComponent={() => (
            <View style={{ height: t.spacing.md }} />
          )}
          ListEmptyComponent={
            <View style={{ padding: t.spacing.lg }}>
              {mode === "search" && !debounced ? (
                <Card>
                  <Title>¿Qué yerba tenés en mente?</Title>
                  <Body>Buscá por nombre de yerba o marca.</Body>
                </Card>
              ) : (
                <QueryState query={yerbas} yerbaCards empty />
              )}
            </View>
          }
          ListFooterComponent={
            <View style={{ padding: t.spacing.lg, gap: t.spacing.md }}>
              {!loadingYerbas && items.length > 0 && yerbas.error && (
                <QueryState query={yerbas} />
              )}
              {yerbas.isFetchingNextPage && <YerbaCardSkeletons />}
              {yerbas.hasNextPage && (
                <Button
                  label={yerbas.isFetchingNextPage ? "Cargando…" : "Más yerbas"}
                  disabled={yerbas.isFetchingNextPage}
                  onPress={() => {
                    void yerbas.fetchNextPage();
                  }}
                />
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              tintColor={t.colors.green}
              refreshing={yerbas.isRefetching}
              onRefresh={() => {
                void yerbas.refetch();
              }}
            />
          }
        />
      </View>
      {filters && (
        <CatalogFiltersSheet
          initial={{ style, brand, country, tradition, discontinued }}
          brands={brands}
          onClose={() => setFilters(false)}
          onApply={(next) => {
            setStyle(next.style);
            setBrand(next.brand);
            setCountry(next.country);
            setTradition(next.tradition);
            setDiscontinued(next.discontinued);
            setFilters(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}
function BrandTile({ brand }: { brand: BrandListItem }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const hasImage = Boolean(brand.image_url && brand.image_url !== failedUrl);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver marca ${brand.name}`}
      onPress={() =>
        router.push({
          pathname: "/marcas/[slug]",
          params: { slug: brand.slug },
        })
      }
      style={({ pressed }) => ({
        width: "100%",
        aspectRatio: 1.15,
        alignItems: "center",
        justifyContent: "center",
        padding: hasImage ? 0 : t.spacing.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        borderRadius: t.radius.card,
        borderCurve: "continuous",
        overflow: "hidden",
        opacity: pressed ? 0.65 : 1,
      })}
    >
      {hasImage ? (
        <Image
          source={brand.image_url!}
          accessible={false}
          contentFit="cover"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          onError={() => setFailedUrl(brand.image_url || undefined)}
        />
      ) : (
        <Text
          style={{
            color: t.colors.green,
            fontFamily: t.fonts.display,
            fontSize: 24,
            lineHeight: 29,
            textAlign: "center",
          }}
        >
          {brand.name}
        </Text>
      )}
    </Pressable>
  );
}

type CatalogFilters = {
  style: string;
  brand: string;
  country: string;
  tradition: string;
  discontinued: string;
};
function CatalogFiltersSheet({
  initial,
  brands,
  onClose,
  onApply,
}: {
  initial: CatalogFilters;
  brands: ReturnType<typeof usePages<BrandListItem>>;
  onClose: () => void;
  onApply: (filters: CatalogFilters) => void;
}) {
  const [draft, setDraft] = useState(initial);
  const pick = (
    key: keyof CatalogFilters,
    label: string,
    options: [string, string][],
  ) => (
    <View
      style={{
        gap: t.spacing.sm,
        paddingVertical: t.spacing.md,
        borderBottomWidth: 1,
        borderColor: t.colors.subtleBorder,
      }}
    >
      <Text
        style={{ fontFamily: t.fonts.bold, fontSize: 16, color: t.colors.ink }}
      >
        {label}
      </Text>
      <Host matchContents seedColor={t.colors.green} colorScheme="light">
        <Picker
          selectedValue={draft[key]}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, [key]: value }))
          }
        >
          {options.map(([value, label]) => (
            <Picker.Item key={value} value={value} label={label} />
          ))}
        </Picker>
      </Host>
    </View>
  );
  return (
    <BottomSheet
      isPresented
      onDismiss={onClose}
      snapPoints={[{ fraction: 0.8 }, "full"]}
      containerColor={t.colors.background}
      contentPadding={0}
      testID="catalog-filters-sheet"
    >
      <RNHostView>
        <View style={{ flex: 1, backgroundColor: t.colors.background }}>
          <View
            style={{
              paddingHorizontal: t.spacing.lg,
              paddingTop: t.spacing.lg,
              paddingBottom: t.spacing.md,
              flexDirection: "row",
              alignItems: "center",
              gap: t.spacing.md,
            }}
          >
            <View style={{ flex: 1, gap: t.spacing.xs }}>
              <Title>Filtros</Title>
              <Body muted>Encontrá una yerba a tu manera.</Body>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar filtros"
              onPress={onClose}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.sage,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Icon name="close" />
            </Pressable>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: t.spacing.lg,
              paddingBottom: t.spacing.md,
            }}
          >
            {pick("brand", "Marca", [
              ["", "Todas las marcas"],
              ...(brands.data?.pages
                .flatMap((page) => page.results)
                .map((brand) => [brand.slug, brand.name] as [string, string]) ||
                []),
            ])}
            {brands.error && <QueryState query={brands} />}
            {brands.hasNextPage && (
              <Button
                label="Cargar más marcas"
                compact
                secondary
                disabled={brands.isFetchingNextPage}
                onPress={() => {
                  void brands.fetchNextPage();
                }}
              />
            )}
            {pick("country", "País de elaboración", [
              ["", "Todos los países"],
              ...["AR", "UY", "PY", "BR"].map(
                (code) => [code, countryLabel(code)] as [string, string],
              ),
            ])}
            {pick("tradition", "Tradición", [
              ["", "Todas las tradiciones"],
              ...["AR", "UY", "PY", "BR"].map(
                (code) => [code, countryLabel(code)] as [string, string],
              ),
            ])}
            {pick("discontinued", "Estado", [
              ["", "Todos"],
              ["false", "Vigentes"],
              ["true", "Discontinuados"],
            ])}
          </ScrollView>
          <View
            style={{
              padding: t.spacing.lg,
              gap: t.spacing.sm,
              borderTopWidth: 1,
              borderColor: t.colors.subtleBorder,
            }}
          >
            <Button label="Aplicar filtros" onPress={() => onApply(draft)} />
            <Button
              label="Limpiar filtros"
              secondary
              onPress={() =>
                setDraft({
                  style: "",
                  brand: "",
                  country: "",
                  tradition: "",
                  discontinued: "",
                })
              }
            />
          </View>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}
