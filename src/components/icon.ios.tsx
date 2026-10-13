import { SymbolView } from "expo-symbols";
import { theme } from "@/theme";
import type { IconProps } from "./icon";
const names = {
  search: "magnifyingglass",
  arrow: "arrow.right",
  arrowLeft: "arrow.left",
  leaf: "leaf",
  star: "star.fill",
  filter: "slider.horizontal.3",
  close: "xmark",
  check: "checkmark",
  verified: "checkmark.seal.fill",
  book: "book",
  heart: "heart",
  heartFilled: "heart.fill",
  compare: "scalemass",
  person: "person",
  eye: "eye",
  eyeOff: "eye.slash",
  external: "arrow.up.right.square",
} as const;
export function Icon({
  name,
  size = 20,
  color = theme.colors.green,
}: IconProps) {
  return (
    <SymbolView
      name={names[name]}
      tintColor={color}
      size={size}
      style={{ width: size, height: size }}
    />
  );
}
