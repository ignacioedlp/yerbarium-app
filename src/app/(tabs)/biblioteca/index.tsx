import { useLocale } from "@/i18n";
import { Library } from "@/screens/library";

export default function LibraryRoute() {
  useLocale();
  return <Library />;
}
