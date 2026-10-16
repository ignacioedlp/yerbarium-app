import { tr, useLocale } from "@/i18n";
import { AnimatedTabs } from "@/components/animated-tabs";
export type CatalogModeProps = {
  value: "yerbas" | "marcas";
  onChange: (value: "yerbas" | "marcas") => void;
};
export function CatalogMode({ value, onChange }: CatalogModeProps) {
  useLocale();
  return (
    <AnimatedTabs
      options={[
        { key: "yerbas", label: tr("Yerbas") },
        { key: "marcas", label: tr("Marcas") },
      ]}
      selected={value}
      onSelect={onChange}
    />
  );
}
