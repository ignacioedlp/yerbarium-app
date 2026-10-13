import React, { useEffect, useState } from "react";
import { AppState } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  QueryClient,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { apiBaseUrl, normalizeError } from "@/api/client";
import {
  publicQuery,
  publicCacheKey,
  CACHE_MAX_AGE,
  canPersistPublicQuery,
} from "@/api/cache-policy";
export function DataProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 300000,
            gcTime: CACHE_MAX_AGE,
            retry: (count, error) =>
              count < 2 &&
              (normalizeError(error).status === 0 ||
                normalizeError(error).status >= 500),
          },
          mutations: { retry: false },
        },
      }),
  );
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: AsyncStorage,
      key: publicCacheKey(apiBaseUrl),
    }),
  );
  useEffect(() => {
    onlineManager.setEventListener((setOnline) =>
      NetInfo.addEventListener((state) =>
        setOnline(
          state.isConnected !== false && state.isInternetReachable !== false,
        ),
      ),
    );
    const subscription = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  return (
    <PersistQueryClientProvider
      client={client}
      onSuccess={() => {
        client.removeQueries({
          predicate: (q) =>
            publicQuery(q.queryKey) &&
            Date.now() - q.state.dataUpdatedAt >= CACHE_MAX_AGE,
        });
      }}
      persistOptions={{
        persister,
        maxAge: CACHE_MAX_AGE,
        buster: "v1",
        dehydrateOptions: {
          shouldDehydrateQuery: (q) =>
            canPersistPublicQuery(
              q.queryKey,
              q.state.data,
              q.state.dataUpdatedAt,
            ),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
