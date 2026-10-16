import { useLocale } from "@/i18n";
import { PublicProfile } from "@/screens/public-profile";

export default function PublicProfileRoute() {
  useLocale();
  return <PublicProfile />;
}
