import { matchLanguage, resolveLanguage, type AppLanguage } from "@/i18n/core";
import type { Account } from "@/api/account-types";
export const languageStorageKey = "yerbarium.app-language";
export function preferredLanguage(
  local: string | null,
  account: string | null | undefined,
  device: readonly string[],
) {
  return resolveLanguage(
    matchLanguage(local) ?? matchLanguage(account),
    device,
  );
}
export class LanguageSaveError extends Error {
  constructor(
    public readonly stage: "device" | "account",
    options?: ErrorOptions,
  ) {
    super(stage, options);
  }
}
export async function saveLanguagePreference(
  language: AppLanguage,
  account: Account | null,
  store: (key: string, value: string) => Promise<void>,
  patch: (language: AppLanguage) => Promise<Account>,
  canSync: () => boolean = () => true,
) {
  try {
    await store(languageStorageKey, language);
  } catch (cause) {
    throw new LanguageSaveError("device", { cause });
  }
  if (
    !account ||
    !canSync() ||
    matchLanguage(account.language_code) === language
  )
    return null;
  try {
    return await patch(language);
  } catch (cause) {
    throw new LanguageSaveError("account", { cause });
  }
}
