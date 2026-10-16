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
    ? packageLabels[key]
    : trimmed || "Sin información";
}

export function aging(min: number | null, max: number | null) {
  if (min === null && max === null) return "Sin información";
  if (min !== null && max !== null)
    return min === max ? `${min} meses` : `${min}–${max} meses`;
  return min !== null ? `Mínimo ${min} meses` : `Máximo ${max} meses`;
}
export function technicalRows(
  profile: TechnicalProfile | null,
): [string, string][] {
  if (!profile) return [];
  return [
    [
      "Contenido de palo",
      {
        PRESENT: "Con palo",
        REDUCED: "Palo reducido / despalada",
        NONE: "Sin palo",
        "": "Sin información",
      }[profile.stem_content],
    ],
    [
      "Estacionamiento",
      aging(profile.aging_months_min, profile.aging_months_max),
    ],
    [
      "Origen de hoja",
      [profile.leaf_origin_country_code, profile.leaf_origin_description]
        .filter(Boolean)
        .join(" · ") || "Sin información",
    ],
    ["Secado", profile.drying_method || "Sin información"],
    ["Molienda", profile.grind_description || "Sin información"],
    [
      "Hoja declarada",
      profile.declared_leaf_percentage !== null
        ? `${profile.declared_leaf_percentage}%`
        : "Sin información",
    ],
    [
      "Palo declarado",
      profile.declared_stem_percentage !== null
        ? `${profile.declared_stem_percentage}%`
        : "Sin información",
    ],
    [
      "Polvo declarado",
      profile.declared_dust_percentage !== null
        ? `${profile.declared_dust_percentage}%`
        : "Sin información",
    ],
    ["Ingredientes", profile.ingredients || "Sin información"],
  ];
}
