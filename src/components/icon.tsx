import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { theme } from "@/theme";
export type IconName =
  | "image"
  | "brand"
  | "announcement"
  | "search"
  | "arrow"
  | "arrowLeft"
  | "leaf"
  | "star"
  | "filter"
  | "close"
  | "check"
  | "plus"
  | "minus"
  | "verified"
  | "book"
  | "heartFilled"
  | "heart"
  | "compare"
  | "person"
  | "eye"
  | "eyeOff"
  | "external"
  | "more"
  | "globe"
  | "language"
  | "mail"
  | "chevronDown"
  | "settings";
export type IconProps = { name: IconName; size?: number; color?: string };
const names = {
  image: "image-outline",
  brand: "storefront-outline",
  announcement: "bullhorn-outline",
  search: "magnify",
  arrow: "arrow-right",
  arrowLeft: "arrow-left",
  leaf: "leaf",
  star: "star",
  filter: "tune-variant",
  close: "close",
  check: "check",
  plus: "plus",
  minus: "minus",
  verified: "check-decagram",
  book: "book-open-outline",
  heart: "heart-outline",
  heartFilled: "heart",
  compare: "scale-balance",
  person: "account-outline",
  eye: "eye-outline",
  eyeOff: "eye-off-outline",
  external: "open-in-new",
  more: "dots-vertical",
  globe: "earth",
  language: "translate",
  mail: "email-outline",
  chevronDown: "chevron-down",
  settings: "cog-outline",
} as const;
export function Icon({
  name,
  size = 20,
  color = theme.colors.green,
}: IconProps) {
  return (
    <MaterialCommunityIcons
      name={names[name]}
      size={size}
      color={color}
      accessible={false}
    />
  );
}
