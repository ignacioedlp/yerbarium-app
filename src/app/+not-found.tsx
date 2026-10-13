import { router } from "expo-router";
import { Page, Title, Body, Button } from "@/components/ui";
export default function NotFound() {
  return (
    <Page safeTop>
      <Title>No encontramos esta pantalla</Title>
      <Body>Volvé al inicio para seguir explorando.</Body>
      <Button label="Ir al inicio" onPress={() => router.replace("/")} />
    </Page>
  );
}
