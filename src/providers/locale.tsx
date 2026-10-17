import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocales } from "expo-localization";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/providers/session";
import { write } from "@/api/client";
import type { Account } from "@/api/account-types";
import { matchLanguage, setLanguage, type AppLanguage } from "@/i18n/core";
import {
  LanguageSaveError,
  languageStorageKey,
  preferredLanguage,
  saveLanguagePreference,
} from "@/preferences/language";
const Context = createContext<null | {
  ready: boolean;
  language: AppLanguage;
  pending: boolean;
  error: string | null;
  chooseLanguage: (language: AppLanguage) => void;
  retry: () => void;
}>(null);
export function useLanguageSettings() {
  const value = useContext(Context);
  if (!value) throw new Error("LocaleProvider missing");
  return value;
}
export const useLocaleReady = () => useLanguageSettings().ready;
export function LocaleProvider({ children }: React.PropsWithChildren) {
  const session = useSession();
  const devices = useLocales();
  const [stored, setStored] = useState<AppLanguage | null>(null);
  const [loaded, setLoaded] = useState(false);
  const choosing = useRef(false);
  const accountRef = useRef(session.user);
  const deviceTags = devices.map((device) => device.languageTag).join(",");
  const target = preferredLanguage(
    stored,
    session.user?.language_code,
    deviceTags.split(","),
  );
  useEffect(() => {
    accountRef.current = session.user;
  }, [session.user]);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(languageStorageKey)
      .catch(() => null)
      .then((value) => {
        if (active) {
          setStored(matchLanguage(value));
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (loaded) setLanguage(target);
  }, [loaded, target]);
  const mutation = useMutation({
    networkMode: "always",
    mutationFn: ({
      language,
      account,
    }: {
      language: AppLanguage;
      account: Account | null;
    }) =>
      saveLanguagePreference(
        language,
        account,
        (key, value) => AsyncStorage.setItem(key, value),
        (next) => write<Account>("auth/me/", "PATCH", { language_code: next }),
        () => accountRef.current?.username === account?.username,
      ),
    onSuccess: (account) => {
      if (account && accountRef.current?.username === account.username)
        session.acceptAccount(account);
    },
    onSettled: () => {
      choosing.current = false;
    },
  });
  function save(next: AppLanguage) {
    if (choosing.current) return;
    choosing.current = true;
    setStored(next);
    setLanguage(next);
    mutation.mutate({ language: next, account: session.user });
  }
  const error = mutation.error
    ? mutation.error instanceof LanguageSaveError &&
      mutation.error.stage === "device"
      ? "No pudimos guardar el idioma en este dispositivo."
      : "El idioma se guardó en este dispositivo, pero no pudimos sincronizarlo con tu cuenta."
    : null;
  return (
    <Context.Provider
      value={{
        ready: loaded,
        language: target,
        pending: mutation.isPending,
        error,
        chooseLanguage: (next) => {
          if (next !== target) save(next);
        },
        retry: () => save(target),
      }}
    >
      {children}
    </Context.Provider>
  );
}
