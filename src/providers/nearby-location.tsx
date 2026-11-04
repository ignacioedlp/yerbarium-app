import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { useQueryClient } from "@tanstack/react-query";
import { NEARBY_QUERY } from "@/stores/catalog";
import {
  createLocationController,
  type LocationSnapshot,
} from "@/stores/location-controller";
interface NearbyLocation extends LocationSnapshot {
  request: () => Promise<void>;
}
const Context = createContext<NearbyLocation | null>(null);
export function NearbyLocationProvider({ children }: React.PropsWithChildren) {
  const client = useQueryClient();
  const [controller] = useState(() =>
    createLocationController(
      {
        permission: Location.getForegroundPermissionsAsync,
        requestPermission: Location.requestForegroundPermissionsAsync,
        servicesEnabled: Location.hasServicesEnabledAsync,
        currentPosition: async () => {
          const fix = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          return {
            latitude: fix.coords.latitude,
            longitude: fix.coords.longitude,
          };
        },
      },
      () => {
        void client.cancelQueries({ queryKey: [NEARBY_QUERY] });
        client.removeQueries({ queryKey: [NEARBY_QUERY] });
      },
    ),
  );
  const snapshot = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  useEffect(() => {
    void controller.locate();
    const sub = AppState.addEventListener("change", (status) => {
      if (status === "active") void controller.locate();
      // Native permission dialogs temporarily make the app inactive.
      else if (status === "background") controller.suspend();
    });
    return () => {
      sub.remove();
      controller.suspend();
    };
  }, [controller]);
  return (
    <Context.Provider
      value={{ ...snapshot, request: () => controller.locate(true) }}
    >
      {children}
    </Context.Provider>
  );
}
export function useNearbyLocation() {
  const value = useContext(Context);
  if (!value) throw new Error("NearbyLocationProvider missing");
  return value;
}
