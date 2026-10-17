import { describe, expect, it, vi } from "vitest";
import {
  LanguageSaveError,
  languageStorageKey,
  preferredLanguage,
  saveLanguagePreference,
} from "./language";
import type { Account } from "@/api/account-types";
const account: Account = {
  username: "tester",
  email: "test@example.test",
  display_name: "Tester",
  bio: "",
  country_code: "AR",
  language_code: "es-AR",
  is_private: false,
};
describe("independent language preference", () => {
  it("prioritizes the device preference over the account and system", () => {
    expect(preferredLanguage("en", "pt-BR", ["es-AR"])).toBe("en");
    expect(preferredLanguage(null, "pt-BR", ["es-AR"])).toBe("pt-BR");
    expect(preferredLanguage(null, null, ["pt-PT"])).toBe("pt");
    expect(preferredLanguage("bad", "bad", ["fr"])).toBe("es-AR");
  });
  it("saves an anonymous choice locally without any account request", async () => {
    const store = vi.fn().mockResolvedValue(undefined),
      patch = vi.fn();
    await saveLanguagePreference("en", null, store, patch);
    expect(store).toHaveBeenCalledWith(languageStorageKey, "en");
    expect(patch).not.toHaveBeenCalled();
  });
  it("patches only a changed account preference and preserves profile fields", async () => {
    const store = vi.fn().mockResolvedValue(undefined),
      patch = vi.fn().mockResolvedValue({ ...account, language_code: "en" });
    expect(await saveLanguagePreference("en", account, store, patch)).toEqual({
      ...account,
      language_code: "en",
    });
    expect(patch).toHaveBeenCalledOnce();
    expect(patch).toHaveBeenCalledWith("en");
    patch.mockClear();
    await saveLanguagePreference("es-AR", account, store, patch);
    expect(patch).not.toHaveBeenCalled();
  });
  it("keeps the local choice when account sync fails and allows retry", async () => {
    const store = vi.fn().mockResolvedValue(undefined),
      patch = vi
        .fn()
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValue({ ...account, language_code: "en" });
    await expect(
      saveLanguagePreference("en", account, store, patch),
    ).rejects.toMatchObject({ stage: "account" });
    expect(store).toHaveBeenCalledWith(languageStorageKey, "en");
    await expect(
      saveLanguagePreference("en", account, store, patch),
    ).resolves.toMatchObject({ language_code: "en" });
  });
  it("reports local storage failure without making an account request", async () => {
    const patch = vi.fn();
    await expect(
      saveLanguagePreference(
        "en",
        account,
        vi.fn().mockRejectedValue(new Error("disk")),
        patch,
      ),
    ).rejects.toBeInstanceOf(LanguageSaveError);
    expect(patch).not.toHaveBeenCalled();
  });
});

it("does not patch a different account if the session changes during local persistence", async () => {
  let finish!: () => void;
  const store = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    ),
    patch = vi.fn(),
    canSync = vi.fn(() => true);
  const saving = saveLanguagePreference("en", account, store, patch, canSync);
  canSync.mockReturnValue(false);
  finish();
  await saving;
  expect(patch).not.toHaveBeenCalled();
});
