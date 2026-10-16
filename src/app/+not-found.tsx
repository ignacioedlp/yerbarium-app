import { tr, useLocale } from "@/i18n";
import { router } from "expo-router";
import { Page, Title, Body, Button } from "@/components/ui";
export default function NotFound() {
  useLocale();
  return (
    <Page safeTop>
      <Title>{tr("No encontramos esta pantalla")}</Title>
      <Body>{tr("Volvé al inicio para seguir explorando.")}</Body>
      <Button label={tr("Ir al inicio")} onPress={() => router.replace("/")} />
    </Page>
  );
}
