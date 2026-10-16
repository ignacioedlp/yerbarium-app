import { afterEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import {
  countLabel,
  getLocale,
  matchLanguage,
  messages,
  resolveLanguage,
  setLanguage,
  subscribeLanguage,
  supportedLanguages,
  tr,
  translate,
} from "./core";
import content from "@/content/editorial.json";
import { sensoryFields } from "@/api/sensory-fields";
import { flavorFamilies, sensoryLabels } from "@/api/community-types";
import { aging, technicalRows } from "@/api/format";

afterEach(() => {
  vi.restoreAllMocks();
  setLanguage("es-AR");
});

it("honors the saved account language, including regional variants, before the device", () => {
  expect(resolveLanguage("pt-BR", ["en-US"])).toBe("pt-BR");
  expect(resolveLanguage("es-AR", ["pt-PT"])).toBe("es-AR");
  expect(resolveLanguage("pt", ["pt-BR"])).toBe("pt");
  expect(resolveLanguage("es", ["es-AR"])).toBe("es");
});
it("uses the first supported device language when unspecified and falls back safely", () => {
  expect(resolveLanguage("", ["fr-FR", "pt-BR"])).toBe("pt-BR");
  expect(resolveLanguage(null, ["en-US"])).toBe("en");
  expect(resolveLanguage("xx", ["es-MX"])).toBe("es");
  expect(resolveLanguage(undefined, ["ja-JP"])).toBe("es-AR");
  expect(matchLanguage(" PT_br ")).toBe("pt-BR");
  expect(matchLanguage("__proto__")).toBeNull();
});
it("updates subscribers once and formats numbers and plural labels in the active language", () => {
  const subscriber = vi.fn();
  const stop = subscribeLanguage(subscriber);
  setLanguage("en");
  setLanguage("en");
  expect(subscriber).toHaveBeenCalledTimes(1);
  expect(getLocale()).toBe("en-GB");
  expect(tr("Guardar cambios")).toBe("Save changes");
  expect(countLabel(1, "{count} opinión", "{count} opiniones")).toBe(
    "1 review",
  );
  expect(countLabel(2, "{count} opinión", "{count} opiniones")).toBe(
    "2 reviews",
  );
  expect(aging(1, 1)).toBe("1 month");
  expect(aging(12, 24)).toBe("12–24 months");
  setLanguage("pt");
  expect(tr("Ingresar")).toBe("Iniciar sessão");
  setLanguage("pt-BR");
  expect(tr("Ingresar")).toBe("Entrar");
  expect(technicalRows(null)).toEqual([]);
  stop();
});
it("interpolates values without translating user text or interpreting its placeholders", () => {
  expect(
    translate("en", "Bloqueaste a @{username}.", { username: "{count}" }),
  ).toBe("You blocked @{count}.");
  expect(translate("pt-BR", "An unrecognized product name")).toBe(
    "An unrecognized product name",
  );
  expect(
    translate("en", "Quitar {name} de favoritas", { name: "Yerba Suave" }),
  ).toBe("Remove Yerba Suave from favorites");
});

const placeholders = (value: string) =>
  [...new Set(value.match(/\{\w+\}/g) ?? [])].sort();
describe.each(supportedLanguages)("%s translation coverage", (language) => {
  it("contains every message and preserves its interpolation parameters", () => {
    expect(Object.keys(messages[language]).sort()).toEqual(
      Object.keys(messages.en).sort(),
    );
    for (const [key, value] of Object.entries(messages[language])) {
      expect(value.trim(), key).not.toBe("");
      expect(placeholders(value), key).toEqual(placeholders(key));
    }
  });
});

it("covers literal UI messages, count labels, sensory scales and every bundled editorial paragraph", () => {
  const required = new Set<string>();
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "i18n") scan(path);
        continue;
      }
      if (!/\.tsx?$/.test(path) || path.endsWith(".test.ts")) continue;
      const file = ts.createSourceFile(
        path,
        readFileSync(path, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      function literals(node: ts.Node) {
        if (ts.isStringLiteral(node)) required.add(node.text);
        else if (ts.isConditionalExpression(node)) {
          literals(node.whenTrue);
          literals(node.whenFalse);
        }
      }
      function walk(node: ts.Node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          if (node.expression.text === "tr" && node.arguments[0])
            literals(node.arguments[0]);
          if (node.expression.text === "countLabel") {
            literals(node.arguments[1]);
            literals(node.arguments[2]);
          }
        }
        ts.forEachChild(node, walk);
      }
      walk(file);
    }
  }
  scan(resolve("src"));
  for (const field of sensoryFields) {
    required.add(field.name);
    required.add(field.group);
    required.add(field.help);
    field.levels.forEach((value) => required.add(value));
  }
  Object.values(sensoryLabels).forEach((value) => required.add(value));
  Object.values(flavorFamilies).forEach((value) => required.add(value));
  function editorial(value: unknown, key = "") {
    if (Array.isArray(value)) value.forEach((item) => editorial(item, key));
    else if (value && typeof value === "object")
      Object.entries(value).forEach(([key, item]) => {
        if (!["id", "slug", "href", "name", "publisher"].includes(key))
          editorial(item, key);
      });
    else if (typeof value === "string") required.add(value);
  }
  editorial(content);
  const missing = [...required].filter(
    (key) => !Object.hasOwn(messages.en, key),
  );
  expect(missing).toEqual([]);
});

it("handles Hermes runtimes without Intl.PluralRules", () => {
  vi.stubGlobal("Intl", { ...Intl, PluralRules: undefined });
  try {
    setLanguage("en");
    expect(countLabel(0, "{count} opinión", "{count} opiniones")).toBe(
      "0 reviews",
    );
    expect(countLabel(1, "{count} opinión", "{count} opiniones")).toBe(
      "1 review",
    );
    setLanguage("pt-BR");
    expect(countLabel(0, "{count} opinión", "{count} opiniones")).toBe(
      "0 avaliação",
    );
    setLanguage("pt");
    expect(countLabel(0, "{count} opinión", "{count} opiniones")).toBe(
      "0 avaliações",
    );
  } finally {
    vi.unstubAllGlobals();
  }
});
