import { useLocale } from "@/i18n";
import { Detail } from "@/screens/detail";

export default function YerbaDetailRoute() {
  useLocale();
  return <Detail />;
}
