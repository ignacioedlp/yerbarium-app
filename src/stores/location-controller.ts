import type { Position } from "./catalog";
export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
}
export interface LocationAdapter {
  permission: () => Promise<LocationPermission>;
  requestPermission: () => Promise<LocationPermission>;
  servicesEnabled: () => Promise<boolean>;
  currentPosition: () => Promise<Position>;
}
export type LocationState =
  "idle" | "loading" | "ready" | "blocked" | "disabled" | "error";
export interface LocationSnapshot {
  position: Position | null;
  state: LocationState;
}
/** Session-only native location, with stale requests invalidated on background/revocation. */
export function createLocationController(
  adapter: LocationAdapter,
  clearQueries: () => void,
) {
  let snapshot: LocationSnapshot = { position: null, state: "loading" };
  let generation = 0;
  let busy = false;
  const listeners = new Set<() => void>();
  const update = (value: LocationSnapshot) => {
    snapshot = value;
    listeners.forEach((listener) => listener());
  };
  const suspend = () => {
    generation++;
    busy = false;
    clearQueries();
    update({ position: null, state: "idle" });
  };
  const locate = async (ask = false) => {
    if (busy) return;
    busy = true;
    const version = ++generation;
    const current = () => version === generation;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      let permission = await adapter.permission();
      if (!current()) return;
      update({ position: null, state: "loading" });
      if (!permission.granted && ask && permission.canAskAgain)
        permission = await adapter.requestPermission();
      if (!current()) return;
      if (!permission.granted) {
        clearQueries();
        update({
          position: null,
          state: permission.canAskAgain ? "idle" : "blocked",
        });
        return;
      }
      const enabled = await adapter.servicesEnabled();
      if (!current()) return;
      if (!enabled) {
        clearQueries();
        update({ position: null, state: "disabled" });
        return;
      }
      const position = await Promise.race([
        adapter.currentPosition(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("timeout")), 15000);
        }),
      ]);
      if (!current()) return;
      if (
        !Number.isFinite(position.latitude) ||
        !Number.isFinite(position.longitude) ||
        Math.abs(position.latitude) > 90 ||
        Math.abs(position.longitude) > 180
      )
        throw new Error("Invalid location");
      update({ position, state: "ready" });
    } catch {
      if (current()) {
        clearQueries();
        update({ position: null, state: "error" });
      }
    } finally {
      clearTimeout(timeout);
      if (current()) busy = false;
    }
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    locate,
    suspend,
  };
}
