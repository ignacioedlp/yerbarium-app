import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { SectionHeading } from "@/components/editorial";
import { Body, Button } from "@/components/ui";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme";
import { tr, useLocale, getLocale } from "@/i18n";
import { useNearbyLocation } from "@/providers/nearby-location";
import { useNearbyStores } from "@/hooks/nearby-stores";
import { apiBaseUrl } from "@/api/client";
import type { StoreBranch } from "@/stores/catalog";

export function StoreLogo({
  branch,
  size = 48,
}: {
  branch: StoreBranch;
  size?: number;
}) {
  const t = useTheme();
  const [failed, setFailed] = useState<string | null>(null);
  const source = branch.store.image_url;
  return (
    <View
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 12,
        backgroundColor: t.colors.sage,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {source && failed !== source ? (
        <Image
          source={{ uri: new URL(source, apiBaseUrl).href }}
          style={{ width: size, height: size }}
          contentFit="contain"
          onError={() => setFailed(source)}
          accessibilityLabel={branch.store.name}
        />
      ) : (
        <Icon name="brand" size={26} />
      )}
    </View>
  );
}

export function StoreIdentity({ branch }: { branch: StoreBranch }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <StoreLogo branch={branch} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            color: t.colors.ink,
            fontFamily: t.fonts.bold,
            fontSize: 16,
          }}
        >
          {branch.store.name}
        </Text>
        {branch.name !== branch.store.name && <Body muted>{branch.name}</Body>}
        <Body muted>
          {tr("{0} km · en línea recta", {
            0: new Intl.NumberFormat(getLocale(), {
              maximumFractionDigits: 1,
            }).format(branch.distance_km),
          })}
        </Body>
      </View>
    </View>
  );
}
export function LocationGate() {
  useLocale();
  const { state, request } = useNearbyLocation();
  const [settingsFailed, setSettingsFailed] = useState(false);
  return (
    <View style={{ gap: 12 }} accessibilityLiveRegion="polite">
      <Body>
        {tr(
          state === "loading"
            ? "Buscando tu ubicación…"
            : state === "disabled"
              ? "Activá la ubicación del dispositivo para ver tiendas cercanas."
              : state === "error"
                ? "No pudimos obtener tu ubicación. Volvé a intentarlo."
                : "Compartí tu ubicación para ver tiendas cercanas.",
        )}
      </Body>
      {state === "loading" ? (
        <ActivityIndicator />
      ) : (
        <Button
          label={tr(
            state === "blocked"
              ? "Abrir ajustes"
              : state === "error" || state === "disabled"
                ? "Reintentar"
                : "Compartir mi ubicación",
          )}
          onPress={() => {
            if (state === "blocked")
              void Linking.openSettings().catch(() => setSettingsFailed(true));
            else void request();
          }}
        />
      )}
      {settingsFailed && (
        <Body>
          {tr(
            "No pudimos abrir los ajustes. Abrilos desde la configuración del dispositivo.",
          )}
        </Body>
      )}
    </View>
  );
}
export function StoreResultsState({
  query,
  emptyMessage,
}: {
  query: ReturnType<typeof useNearbyStores>;
  emptyMessage?: string;
}) {
  useLocale();
  if (query.data?.length && !query.isError && query.fetchStatus !== "paused")
    return null;
  return (
    <View style={{ gap: 12 }} accessibilityLiveRegion="polite">
      {!query.data && !query.error && query.fetchStatus !== "paused" && (
        <ActivityIndicator />
      )}
      {query.fetchStatus === "paused" && (
        <Body>
          {tr("Sin conexión. Volvé a conectarte para buscar tiendas.")}
        </Body>
      )}
      {query.isError && (
        <>
          <Body>
            {tr("No pudimos cargar las tiendas. Intentá nuevamente.")}
          </Body>
          <Button
            label={tr("Reintentar")}
            onPress={() => {
              void query.refetch();
            }}
          />
        </>
      )}
      {query.data?.length === 0 && (
        <Body>
          {emptyMessage ??
            tr("No encontramos tiendas a menos de 25 km de tu ubicación.")}
        </Body>
      )}
    </View>
  );
}
export function NearbyStores({ yerba }: { yerba?: string } = {}) {
  const t = useTheme();
  useLocale();
  const { position } = useNearbyLocation();
  const query = useNearbyStores(5, yerba);
  return (
    <View style={{ gap: 12 }} testID="home-nearby-stores">
      <SectionHeading
        title={tr("Tiendas cercanas")}
        compact
        action={position ? tr("Ver mapa") : undefined}
        onPress={
          position
            ? () =>
                router.push({
                  pathname: "/tiendas",
                  params: yerba ? { yerba } : {},
                })
            : undefined
        }
      />
      {yerba && (
        <Body muted>
          {tr(
            "Catálogo habitual. Confirmá stock y precio con la tienda antes de ir.",
          )}
        </Body>
      )}
      {!position ? (
        <LocationGate />
      ) : (
        <>
          <StoreResultsState
            query={query}
            emptyMessage={
              yerba
                ? tr(
                    "No encontramos tiendas con esta yerba a menos de 25 km de tu ubicación.",
                  )
                : undefined
            }
          />
          {query.data?.map((branch) => (
            <Pressable
              key={branch.id}
              accessibilityRole="button"
              accessibilityLabel={tr("Ver {0} en el mapa", {
                0: `${branch.store.name}, ${branch.name}`,
              })}
              onPress={() =>
                router.push({
                  pathname: "/tiendas",
                  params: { branchId: branch.id, ...(yerba ? { yerba } : {}) },
                })
              }
              style={({ pressed }) => ({
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: t.colors.subtleBorder,
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <StoreIdentity branch={branch} />
              </View>
              <Icon name="arrow" />
            </Pressable>
          ))}
        </>
      )}
    </View>
  );
}
