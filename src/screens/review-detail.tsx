import { router, useLocalSearchParams } from "expo-router";
import { useResource } from "@/hooks/queries";
import { useSession } from "@/providers/session";
import { Review } from "@/api/community-types";
import { Page, Body, Button, Title } from "@/components/ui";
import { ReviewCard } from "@/components/review-card";
import { tr, useLocale } from "@/i18n";
export function ReviewDetail() {
  useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const valid = /^\d+$/.test(id ?? "");
  const query = useResource<Review>(`reviews/${id}/`, Boolean(user), valid);
  return (
    <Page>
      <Title>{tr("Reseña")}</Title>
      {valid && query.isPending && <Body>{tr("Cargando…")}</Body>}
      {(!valid || query.isError) && (
        <>
          <Body>{tr("Esta reseña no está disponible.")}</Body>
          <Button
            secondary
            label={tr("Reintentar")}
            onPress={() => void query.refetch()}
          />
        </>
      )}
      {query.data && !query.isError && (
        <>
          <ReviewCard review={query.data} />
          <Button
            label={tr("Ver yerba")}
            onPress={() =>
              router.push({
                pathname: "/yerbas/[slug]",
                params: { slug: query.data.yerba_slug },
              })
            }
          />
        </>
      )}
    </Page>
  );
}
