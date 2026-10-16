import { tr, useLocale } from "@/i18n";
import { Image } from "expo-image";
const flags: Record<string, number> = {
  AR: require("../../assets/flags/ar.svg"),
  UY: require("../../assets/flags/uy.svg"),
  PY: require("../../assets/flags/py.svg"),
  BR: require("../../assets/flags/br.svg"),
  BO: require("../../assets/flags/bo.svg"),
  CL: require("../../assets/flags/cl.svg"),
  ES: require("../../assets/flags/es.svg"),
  PT: require("../../assets/flags/pt.svg"),
  GB: require("../../assets/flags/gb.svg"),
};
export function CountryFlag({
  code,
  country,
}: {
  code: string;
  country: string;
}) {
  useLocale();
  const source = flags[code.toUpperCase()];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: 22, height: 15, borderRadius: 2 }}
      accessibilityLabel={tr("Bandera de {0}", { 0: tr(country) })}
    />
  );
}
