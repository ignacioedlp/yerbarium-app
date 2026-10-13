import { Image } from "expo-image";
const flags: Record<string, number> = {
  AR: require("../../assets/flags/ar.svg"),
  UY: require("../../assets/flags/uy.svg"),
  PY: require("../../assets/flags/py.svg"),
  BR: require("../../assets/flags/br.svg"),
};
export function CountryFlag({
  code,
  country,
}: {
  code: string;
  country: string;
}) {
  const source = flags[code.toUpperCase()];
  if (!source) return null;
  return (
    <Image
      source={source}
      style={{ width: 22, height: 15, borderRadius: 2 }}
      accessibilityLabel={`Bandera de ${country}`}
    />
  );
}
