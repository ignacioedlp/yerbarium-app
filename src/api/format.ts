import { tr } from "@/i18n/core";
import type { TechnicalProfile } from "./types";

const packageLabels: Record<string, string> = {
  bag: "Paquete",
  bolsa: "Paquete",
  paquete: "Paquete",
  package: "Paquete",
  packet: "Paquete",
  "paper bag": "Paquete de papel",
  "bolsa de papel": "Paquete de papel",
  "paquete de papel": "Paquete de papel",
  box: "Caja",
  caja: "Caja",
  tin: "Lata",
  can: "Lata",
  lata: "Lata",
  jar: "Frasco",
  frasco: "Frasco",
};

export function packageTypeLabel(value: string) {
  const trimmed = value.trim();
  const key = trimmed.toLocaleLowerCase("es");
  // Preserve specific descriptions that are not part of the known vocabulary.
  return Object.hasOwn(packageLabels, key)
    ? tr(packageLabels[key])
    : trimmed || tr("Sin información");
}

export function aging(min: number | null, max: number | null) {
  if (min === null && max === null) return tr("Sin información");
  if (min !== null && max !== null)
    return min === max
      ? min === 1
        ? tr("1 mes")
        : tr("{0} meses", { 0: min })
      : tr("{0}–{1} meses", { 0: min, 1: max });
  return min !== null
    ? tr("Mínimo {0} meses", { 0: min })
    : tr("Máximo {0} meses", { 0: max });
}
export function technicalRows(
  profile: TechnicalProfile | null,
): [string, string][] {
  if (!profile) return [];
  return [
    [
      tr("Contenido de palo"),
      {
        PRESENT: tr("Con palo"),
        REDUCED: tr("Palo reducido / despalada"),
        NONE: tr("Sin palo"),
        "": tr("Sin información"),
      }[profile.stem_content],
    ],
    [
      tr("Estacionamiento"),
      aging(profile.aging_months_min, profile.aging_months_max),
    ],
    [
      tr("Origen de hoja"),
      [profile.leaf_origin_country_code, profile.leaf_origin_description]
        .filter(Boolean)
        .join(" · ") || tr("Sin información"),
    ],
    [tr("Secado"), profile.drying_method || tr("Sin información")],
    [tr("Molienda"), profile.grind_description || tr("Sin información")],
    [
      tr("Hoja declarada"),
      profile.declared_leaf_percentage !== null
        ? `${profile.declared_leaf_percentage}%`
        : tr("Sin información"),
    ],
    [
      tr("Palo declarado"),
      profile.declared_stem_percentage !== null
        ? `${profile.declared_stem_percentage}%`
        : tr("Sin información"),
    ],
    [
      tr("Polvo declarado"),
      profile.declared_dust_percentage !== null
        ? `${profile.declared_dust_percentage}%`
        : tr("Sin información"),
    ],
    [tr("Ingredientes"), profile.ingredients || tr("Sin información")],
  ];
}
