import { SymbolView } from "expo-symbols";
import { theme } from "@/theme";
import type { IconProps } from "./icon";
const names = {
  image: "photo",
  brand: "storefront",
  announcement: "megaphone",
  search: "magnifyingglass",
  arrow: "arrow.right",
  arrowLeft: "arrow.left",
  leaf: "leaf",
  star: "star.fill",
  filter: "slider.horizontal.3",
  close: "xmark",
  check: "checkmark",
  plus: "plus",
  minus: "minus",
  verified: "checkmark.seal.fill",
  book: "book",
  heart: "heart",
  heartFilled: "heart.fill",
  compare: "scalemass",
  person: "person",
  eye: "eye",
  eyeOff: "eye.slash",
  external: "arrow.up.right.square",
  more: "ellipsis",
  globe: "globe",
  language: "character.bubble",
  mail: "envelope",
  chevronDown: "chevron.down",
  settings: "gearshape",
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
