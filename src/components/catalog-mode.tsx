import { AnimatedTabs } from "@/components/animated-tabs";
export type CatalogModeProps = {
  value: "yerbas" | "marcas";
  onChange: (value: "yerbas" | "marcas") => void;
};
export function CatalogMode({ value, onChange }: CatalogModeProps) {
  return (
    <AnimatedTabs
      options={[
        { key: "yerbas", label: "Yerbas" },
        { key: "marcas", label: "Marcas" },
      ]}
      selected={value}
      onSelect={onChange}
    />
  );
}
