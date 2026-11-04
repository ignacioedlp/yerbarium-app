import { StoreMapCard } from "@/components/store-map-card";
import React, { useEffect, useRef, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Constants from "expo-constants";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Body, Button } from "@/components/ui";
import { Icon } from "@/components/icon";
import { LocationGate, StoreResultsState } from "@/components/nearby-stores";
import { useNearbyLocation } from "@/providers/nearby-location";
import { useNearbyStores } from "@/hooks/nearby-stores";
import { directionsUrl, type Position } from "@/stores/catalog";
import { useTheme } from "@/theme";
import { tr, useLocale } from "@/i18n";

export function Stores() {
  const t = useTheme();
  useLocale();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { branchId, yerba } = useLocalSearchParams<{
    branchId?: string;
    yerba?: string;
  }>();
  const { position } = useNearbyLocation();
  const mapAvailable =
    Platform.OS !== "android" ||
    Constants.expoConfig?.extra?.mapsAndroidConfigured === true;
  const query = useNearbyStores("all", yerba);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [directionsError, setDirectionsError] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTimedOut, setMapTimedOut] = useState(false);
  const [mapAttempt, setMapAttempt] = useState(0);
  const [cardHeight, setCardHeight] = useState(180);
  const map = useRef<MapView>(null);
  const branches = query.data ?? [];
  const selected =
    branches.find((b) => b.id === selectedId) ??
    branches.find((b) => b.id === Number(branchId)) ??
    branches[0];
  const center = (point: Position) =>
    map.current?.animateToRegion(
      { ...point, latitudeDelta: 0.08, longitudeDelta: 0.08 },
      350,
    );
  useEffect(() => {
    if (selected && mapReady) center(selected);
  }, [selected, mapReady]);
  useEffect(() => {
    if (!position || !mapAvailable) return;
    if (mapLoaded) return;
    const timer = setTimeout(() => setMapTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [position, mapAttempt, mapLoaded, mapAvailable]);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/"));
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      {position && mapAvailable && (
        <MapView
          key={mapAttempt}
          ref={map}
          style={{ flex: 1 }}
          initialRegion={{
            ...(selected ?? position),
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
          userInterfaceStyle={t.dark ? "dark" : "light"}
          showsUserLocation
          showsMyLocationButton={false}
          toolbarEnabled={false}
          mapPadding={{
            top: insets.top + 64,
            bottom: insets.bottom + cardHeight + 32,
            left: 24,
            right: 24,
          }}
          onMapReady={() => {
            setMapReady(true);
            setMapLoaded(true);
            setMapTimedOut(false);
          }}
          onMapLoaded={() => {
            setMapReady(true);
            setMapLoaded(true);
            setMapTimedOut(false);
          }}
          accessibilityLabel={tr("Mapa de tiendas")}
        >
          {branches.map((branch) => (
            <Marker
              key={branch.id}
              coordinate={branch}
              title={branch.store.name}
              description={branch.name}
              pinColor={selected?.id === branch.id ? t.colors.green : "#a5742e"}
              onPress={() => {
                setDirectionsError(null);
                setSelectedId(branch.id);
              }}
              identifier={String(branch.id)}
            />
          ))}
        </MapView>
      )}
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: Math.max(insets.left, 16),
          right: Math.max(insets.right, 16),
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={tr("Volver")}
          onPress={back}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: t.colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="arrowLeft" />
        </Pressable>
        {position && mapAvailable && (
          <Button label={tr("Mi ubicación")} onPress={() => center(position)} />
        )}
      </View>
      <ScrollView
        testID="selected-store-card"
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
        showsVerticalScrollIndicator={false}
        style={{
          position: "absolute",
          alignSelf: "center",
          width: width - Math.max(insets.left, 16) - Math.max(insets.right, 16),
          maxWidth: 480,
          bottom: insets.bottom + 16,
          maxHeight: "55%",
          borderRadius: t.radius.card,
          backgroundColor: t.colors.surface,
        }}
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
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
            {!mapAvailable && (
              <Body>
                {tr("El mapa no está disponible. Podés usar Cómo llegar.")}
              </Body>
            )}
            {mapTimedOut && (
              <>
                <Body>
                  {tr("Si el mapa no carga, podés usar Cómo llegar.")}
                </Body>
                <Button
                  secondary
                  label={tr("Recargar mapa")}
                  onPress={() => {
                    setMapReady(false);
                    setMapLoaded(false);
                    setMapTimedOut(false);
                    setMapAttempt((n) => n + 1);
                  }}
                />
              </>
            )}
            {selected && (
              <>
                <StoreMapCard
                  branch={selected}
                  onDirections={() => {
                    setDirectionsError(null);
                    void Linking.openURL(
                      directionsUrl(selected, Platform.OS),
                    ).catch(() => setDirectionsError(selected.id));
                  }}
                />
                {directionsError === selected.id && (
                  <Body>
                    {tr(
                      "No pudimos abrir las indicaciones. Volvé a intentarlo.",
                    )}
                  </Body>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
