import { tr, useLocale } from "@/i18n";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import {
  connectAuth,
  get,
  publicApi,
  normalizeError,
  apiBaseUrl,
} from "@/api/client";
import { SessionManager, TokenPair } from "@/api/session-manager";
import { Account } from "@/api/account-types";
const key = `yerbarium.refresh.${apiBaseUrl.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
const Context = createContext<null | {
  user: Account | null;
  ready: boolean;
  error: string | null;
  login: (
    mode: "login" | "register",
    values: Record<string, string>,
  ) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  reload: () => Promise<void>;
}>(null);
export function SessionProvider({ children }: React.PropsWithChildren) {
  useLocale();
  const client = useQueryClient();
  const [user, setUser] = useState<Account | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState<string | null>(null);
  const [manager] = useState(
    () =>
      new SessionManager(
        {
          set: (token) => SecureStore.setItemAsync(key, token),
          remove: () => SecureStore.deleteItemAsync(key),
        },
        async (token) =>
          (
            await publicApi.post<TokenPair>("auth/token/refresh/", {
              refresh: token,
            })
          ).data,
        (hasSession) => {
          if (!hasSession) {
            setUser(null);
            void client.cancelQueries({
              predicate: (q) => q.queryKey[0] === "private",
            });
            client.removeQueries({
              predicate: (q) => q.queryKey[0] === "private",
            });
          }
        },
      ),
  );
  const reload = useCallback(async () => {
    const generation = manager.generation;
    const account = await get<Account>("auth/me/", undefined, undefined, true);
    if (generation === manager.generation) setUser(account);
  }, [manager]);
  const restore = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(key);
      setError(null);
      if (token) {
        manager.hydrate(token);
        await manager.refresh();
        await reload();
      }
    } catch (e) {
      if (normalizeError(e).status !== 401)
        setError(
          tr("No pudimos restaurar tu sesión. Volvé a intentar con conexión."),
        );
    } finally {
      setReady(true);
    }
  }, [manager, reload]);
  useEffect(() => {
    const disconnect = connectAuth({
      access: () => manager.access,
      generation: () => manager.generation,
      refresh: () => manager.refresh(),
    }); // Restore is asynchronous I/O; state is updated after SecureStore/API responses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void restore();
    return disconnect;
  }, [manager, restore]);
  async function login(
    mode: "login" | "register",
    values: Record<string, string>,
  ) {
    const { data } = await publicApi.post<TokenPair & { user: Account }>(
      `auth/token/${mode}/`,
      values,
    );
    await client.cancelQueries({
      predicate: (q) => q.queryKey[0] === "private",
    });
    client.removeQueries({ predicate: (q) => q.queryKey[0] === "private" });
    if (await manager.accept(data)) {
      setUser(data.user);
      setError(null);
    }
  }
  async function logout() {
    const token = manager.refreshToken;
    await manager.clear();
    if (token)
      await publicApi
        .post("auth/token/logout/", { refresh: token })
        .catch(() => undefined);
  }
  return (
    <Context.Provider
      value={{ user, ready, error, login, logout, restore, reload }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error("SessionProvider missing");
  return value;
}
