import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Linking, View } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { isDevice } from "expo-device";
import { router, useFocusEffect, useIsFocused } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { lookupBarcode, scannedBarcode } from "@/api/barcodes";
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
  const [cameraError, setCameraError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const locked = useRef(false);
  const navigated = useRef(false);
  useFocusEffect(
    useCallback(() => {
      locked.current = false;
      navigated.current = false;
      setCode(null);
      setCameraError(false);
      setActionError(false);
      void getPermission().catch(() => setActionError(true));
      return () => {
        locked.current = true;
        setCode(null);
      };
    }, [getPermission]),
  );
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state === "active")
        void getPermission().catch(() => setActionError(true));
    });
    return () => subscription.remove();
  }, [getPermission]);
  const lookup = useQuery({
    queryKey: ["barcode", code],
    queryFn: ({ signal }) => lookupBarcode(code!, signal),
    enabled: !!code && focused && foreground,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
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
    setCameraError(false);
    setActionError(false);
  };
  return (
    <Page safeTop tabBarClearance>
      <Title>{tr("Escanear")}</Title>
      <Body>
        {tr("Apuntá al código de barras del paquete para encontrar la yerba.")}
      </Body>
      {!permission && !actionError ? (
        <ActivityIndicator
          accessibilityLabel={tr("Comprobando permiso de cámara…")}
          color={theme.colors.green}
        />
      ) : !permission ? null : !permission.granted ? (
        <Card>
          <Title>{tr("Necesitamos acceso a la cámara")}</Title>
          <Body>{tr("Usamos la cámara para leer códigos EAN-13 y UPC.")}</Body>
          <Button
            label={tr(
              permission.canAskAgain ? "Permitir cámara" : "Abrir ajustes",
            )}
            onPress={() => {
              setActionError(false);
              void (
                permission.canAskAgain
                  ? requestPermission()
                  : Linking.openSettings()
              ).catch(() => setActionError(true));
            }}
          />
        </Card>
      ) : code ? (
        <Card>
          {lookup.isError ? (
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
          ) : lookup.data?.status === "NOT_FOUND" ||
            lookup.data?.status === "FOUND_EXTERNAL" ? (
            <>
              <Title>{tr("Código sin ficha en Yerbarium")}</Title>
              <Body>
                {tr(
                  "Todavía no tenemos una ficha del catálogo para este código.",
                )}
              </Body>
              {lookup.data.status === "FOUND_EXTERNAL" &&
                !!lookup.data.product.name && (
                  <Body>{lookup.data.product.name}</Body>
                )}
              <Button
                label={tr("Sugerir esta yerba")}
                onPress={() => {
                  if (!lookup.data) return;
                  const params = suggestionFromScan(code, lookup.data);
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
        </Card>
      ) : cameraError || !isDevice ? (
        <Card>
          <Title>{tr("Cámara no disponible")}</Title>
          <Body>
            {tr(
              !isDevice
                ? "El escaneo necesita la cámara de un dispositivo físico."
                : "No pudimos iniciar la cámara. Intentá de nuevo.",
            )}
          </Body>
          {isDevice && <Button label={tr("Reintentar")} onPress={reset} />}
        </Card>
      ) : focused && foreground ? (
        <View
          style={{
            height: 280,
            overflow: "hidden",
            borderRadius: theme.radius.card,
            backgroundColor: theme.colors.ink,
          }}
        >
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            autofocus="on"
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "upc_a", "upc_e"],
            }}
            onBarcodeScanned={online ? scan : undefined}
            onMountError={() => setCameraError(true)}
          />
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
