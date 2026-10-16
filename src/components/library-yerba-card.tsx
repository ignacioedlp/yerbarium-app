import { tr, useLocale } from "@/i18n";
import {
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { View } from "react-native";
import { get } from "@/api/client";
import type { LibraryEntry } from "@/api/community-types";
import type { PaginatedResponse, YerbaMateListItem } from "@/api/types";
import { Button, ErrorMessage, YerbaCard } from "@/components/ui";
import { theme } from "@/theme";

// Library responses contain a smaller product summary than catalog responses.
// Enrich it with public catalog data, while keeping the library card usable offline.
export function LibraryYerbaCard({
  yerba,
  index = 0,
}: {
  yerba: LibraryEntry["yerba"];
  index?: number;
}) {
  useLocale();
  const client = useQueryClient();
  const complete =
    yerba.stats !== undefined &&
    yerba.styles !== undefined &&
    yerba.manufacturing_country_code !== undefined;
  const path = `yerbas/${encodeURIComponent(yerba.slug)}/`;
  const catalog = useQuery<YerbaMateListItem>({
    queryKey: ["public", path],
    queryFn: ({ signal }) => get<YerbaMateListItem>(path, undefined, signal),
    enabled: !complete,
    placeholderData: () =>
      client
        .getQueriesData<InfiniteData<PaginatedResponse<YerbaMateListItem>>>({
          queryKey: ["public", "yerbas/"],
        })
        .flatMap(
          ([, data]) => data?.pages.flatMap((page) => page.results) ?? [],
        )
        .find((item) => item.slug === yerba.slug),
  });
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <YerbaCard
        yerba={complete ? yerba : (catalog.data ?? yerba)}
        index={index}
        loading={!complete && catalog.fetchStatus === "fetching"}
      />
      {!complete && catalog.isError && !catalog.data && (
        <>
          <ErrorMessage
            message={tr("No pudimos cargar los detalles de esta yerba.")}
          />
          <Button
            label={tr("Reintentar detalles")}
            compact
            secondary
            onPress={() => {
              void catalog.refetch();
            }}
          />
        </>
      )}
    </View>
  );
}
