import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  StyleSheet,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { isDevice } from "expo-device";
import {
  router,
  useFocusEffect,
  useIsFocused,
  useLocalSearchParams,
} from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  lookupBarcode,
  scannedBarcode,
  type BarcodeLookup,
} from "@/api/barcodes";
import { suggestionFromScan } from "@/api/yerba-suggestions";
import { normalizeError } from "@/api/client";
import {
  Body,
  Button,
  Card,
  ErrorMessage,
  Page,
  Title,
  useCanWrite,
} from "@/components/ui";
import { SectionHeading } from "@/components/editorial";
import { tr, useLocale } from "@/i18n";
import { useTheme } from "@/theme";

export function Scanner() {
  const theme = useTheme();
  useLocale();
  const focused = useIsFocused();
  const online = useCanWrite();
  const [permission, requestPermission, getPermission] = useCameraPermissions({
    get: false,
  });
  const [foreground, setForeground] = useState(
    AppState.currentState === "active",
  );
  const [code, setCode] = useState<string | null>(null);
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const previewMissing = __DEV__ && !isDevice && preview === "external";
  const [cameraError, setCameraError] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [wasCameraActive, setWasCameraActive] = useState(false);
  const [actionError, setActionError] = useState(false);
  const locked = useRef(false);
  const navigated = useRef(false);
  useFocusEffect(
    useCallback(() => {
      locked.current = false;
      navigated.current = false;
      setCode(previewMissing ? "2000000000008" : null);
      setCameraError(false);
      setActionError(false);
      void getPermission().catch(() => setActionError(true));
      return () => {
        locked.current = true;
        setCode(null);
      };
    }, [getPermission, previewMissing]),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state === "active")
        void getPermission().catch(() => setActionError(true));
    });
    return () => subscription.remove();
  }, [getPermission]);
  const cameraActive =
    focused &&
    foreground &&
    !!permission?.granted &&
    !requestingPermission &&
    !code &&
    !cameraError &&
    isDevice &&
    !previewMissing;
  if (wasCameraActive !== cameraActive) {
    setWasCameraActive(cameraActive);
    setCameraReady(false);
  }
  useEffect(() => {
    if (!cameraActive) return;
    // Native startup failures do not always dispatch onMountError.
    if (cameraReady) return;
    const timeout = setTimeout(() => setCameraError(true), 12000);
    return () => clearTimeout(timeout);
  }, [cameraActive, cameraReady]);
  const allowCamera = async () => {
    setActionError(false);
    setRequestingPermission(true);
    try {
      await requestPermission();
    } catch {
      setActionError(true);
    } finally {
      setRequestingPermission(false);
    }
  };
  const lookup = useQuery({
    queryKey: ["barcode", code],
    queryFn: ({ signal }) => lookupBarcode(code!, signal),
    enabled: !!code && focused && foreground && !previewMissing,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  const result: BarcodeLookup | undefined =
    previewMissing && code
      ? {
          status: "FOUND_EXTERNAL",
          barcode: code,
          external_source: "OPEN_FOOD_FACTS",
          product: { name: "Yerba mate de ejemplo", brand: "Marca de ejemplo" },
        }
      : lookup.data;
  useEffect(() => {
    if (
      !focused ||
      !foreground ||
      !code ||
      lookup.data?.status !== "FOUND_LOCAL" ||
      navigated.current
    )
      return;
    navigated.current = true;
    router.push({
      pathname: "/yerbas/[slug]",
      params: { slug: lookup.data.yerba.slug },
    });
  }, [code, focused, foreground, lookup.data]);
  const scan = ({ type, data }: BarcodeScanningResult) => {
    if (locked.current || !focused || !foreground || !online) return;
    const barcode = scannedBarcode(type, data);
    if (!barcode) return;
    locked.current = true;
    setCode(barcode);
  };
  const reset = () => {
    locked.current = false;
    navigated.current = false;
    setCode(null);
    router.setParams({ preview: undefined });
    setCameraError(false);
    setActionError(false);
  };
  return (
    // Dark paper uses mixBlendMode, which composites native camera previews offscreen.
    <Page safeTop tabBarClearance textured={false}>
      <Title>{tr("Escanear")}</Title>
      <Body>
        {tr("Apuntá al código de barras del paquete para encontrar la yerba.")}
      </Body>
      {!previewMissing && !permission && !actionError ? (
        <ActivityIndicator
          accessibilityLabel={tr("Comprobando permiso de cámara…")}
          color={theme.colors.green}
        />
      ) : !previewMissing && !permission ? null : !previewMissing &&
        !permission?.granted ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionHeading
            title={tr("Necesitamos acceso a la cámara")}
            compact
          />
          <Body>{tr("Usamos la cámara para leer códigos EAN-13 y UPC.")}</Body>
          <Button
            label={tr(
              permission?.canAskAgain ? "Permitir cámara" : "Abrir ajustes",
            )}
            disabled={requestingPermission}
            onPress={() => {
              if (permission?.canAskAgain) void allowCamera();
              else
                void Linking.openSettings().catch(() => setActionError(true));
            }}
          />
        </View>
      ) : code ? (
        <View style={{ gap: theme.spacing.md }}>
          {!previewMissing && lookup.isError ? (
            <>
              <Title>{tr("No pudimos buscar el código")}</Title>
              <ErrorMessage
                message={
                  normalizeError(lookup.error).status === 429
                    ? tr(
                        "Demasiados intentos. Esperá un momento y volvé a intentar.",
                      )
                    : tr("Revisá tu conexión e intentá de nuevo.")
                }
              />
              <Button
                label={tr("Reintentar")}
                disabled={!online}
                onPress={() => {
                  void lookup.refetch();
                }}
              />
            </>
          ) : result?.status === "NOT_FOUND" ||
            result?.status === "FOUND_EXTERNAL" ? (
            <>
              <SectionHeading
                title={tr(
                  result.status === "FOUND_EXTERNAL"
                    ? "Producto encontrado en una fuente externa"
                    : "Código sin ficha en Yerbarium",
                )}
                compact
              />
              <Body>
                {tr(
                  result.status === "FOUND_EXTERNAL"
                    ? "Encontramos sus datos en Open Food Facts. Podés usarlos para sugerir esta yerba al catálogo."
                    : "Todavía no tenemos una ficha del catálogo para este código.",
                )}
              </Body>
              {result.status === "FOUND_EXTERNAL" && !!result.product.name && (
                <View style={{ gap: theme.spacing.xs }}>
                  <Body>{result.product.name}</Body>
                  {!!result.product.brand && (
                    <Body muted>{result.product.brand}</Body>
                  )}
                </View>
              )}
              <Button
                label={tr("Sugerir esta yerba")}
                onPress={() => {
                  if (!result) return;
                  const params = suggestionFromScan(code, result);
                  if (params)
                    router.push({ pathname: "/sugerir-yerba", params });
                }}
              />
            </>
          ) : (
            <>
              <ActivityIndicator color={theme.colors.green} />
              <Body>
                {tr(
                  lookup.fetchStatus === "paused"
                    ? "Esperando conexión…"
                    : "Buscando en Yerbarium…",
                )}
              </Body>
            </>
          )}
          <Button
            label={tr("Escanear otro código")}
            secondary
            onPress={reset}
          />
        </View>
      ) : cameraError || !isDevice ? (
        <View style={{ gap: theme.spacing.md }}>
          <SectionHeading title={tr("Cámara no disponible")} compact />
          <Body>
            {tr(
              !isDevice
                ? "El escaneo necesita la cámara de un dispositivo físico."
                : "No pudimos iniciar la cámara. Intentá de nuevo.",
            )}
          </Body>
          {isDevice && <Button label={tr("Reintentar")} onPress={reset} />}
        </View>
      ) : cameraActive ? (
        <View
          style={{
            height: 280,
            overflow: "hidden",
            borderRadius: theme.radius.card,
            backgroundColor: theme.colors.ink,
          }}
        >
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            autofocus="on"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "upc_a", "upc_e"],
            }}
            onBarcodeScanned={online ? scan : undefined}
            onCameraReady={() => setCameraReady(true)}
            onMountError={() => setCameraError(true)}
          />
          {!cameraReady && (
            <ActivityIndicator
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
              accessibilityLabel={tr("Comprobando permiso de cámara…")}
              color={theme.colors.green}
            />
          )}
        </View>
      ) : null}
      {actionError && (
        <Card>
          <ErrorMessage
            message={tr(
              "No pudimos acceder al permiso de cámara. Intentá de nuevo.",
            )}
          />
          <Button
            label={tr("Reintentar")}
            onPress={() => {
              setActionError(false);
              void getPermission().catch(() => setActionError(true));
            }}
          />
        </Card>
      )}
      <Button
        label={tr("Buscar por nombre")}
        secondary
        onPress={() => router.navigate("/(tabs)/explorar")}
      />
    </Page>
  );
}
