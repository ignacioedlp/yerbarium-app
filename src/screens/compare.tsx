import { LeafRating } from "@/components/leaf-rating";
import { useQueries } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScrollView, View, Text } from "react-native";
import {
  Page,
  Title,
  Body,
  Button,
  Card,
  QueryState,
  styles,
} from "@/components/ui";
import { useComparison } from "@/providers/comparison";
import { get } from "@/api/client";
import { technicalRows } from "@/api/format";
import { YerbaMateDetail } from "@/api/types";
import { sensoryLabels } from "@/api/community-types";
import { theme } from "@/theme";
import { EditorialHero } from "@/components/editorial";
export function Compare() {
  const { slugs, toggle, clear } = useComparison();
  const queries = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["public", `yerbas/${slug}/`],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        get<YerbaMateDetail>(
          `yerbas/${encodeURIComponent(slug)}/`,
          undefined,
          signal,
        ),
    })),
  });
  const ready =
    slugs.length >= 2 && queries.every((query) => query.data !== undefined);
  const rows = [
    ["Marca", (y: YerbaMateDetail) => y.brand.name],
    [
      "Elaboración",
      (y: YerbaMateDetail) => y.manufacturing_country_code || "Sin información",
    ],
    [
      "Tradición",
      (y: YerbaMateDetail) => y.tradition_country_code || "Sin información",
    ],
    [
      "Estilos",
      (y: YerbaMateDetail) =>
        y.styles.map((style) => style.name).join(" · ") || "Sin información",
    ],
    [
      "Promedio",
      (y: YerbaMateDetail) =>
        y.stats.rating_average
          ? `${y.stats.rating_average} / 5 (${y.stats.review_count})`
          : "Sin opiniones",
    ],
    [
      "Presentaciones",
      (y: YerbaMateDetail) =>
        y.presentations.map((item) => `${item.weight_grams} g`).join(" · ") ||
        "Sin información",
    ],
    ...[
      "Contenido de palo",
      "Estacionamiento",
      "Origen de hoja",
      "Secado",
      "Molienda",
      "Hoja declarada",
      "Palo declarado",
      "Polvo declarado",
      "Ingredientes",
    ].map((label) => [
      label,
      (y: YerbaMateDetail) =>
        technicalRows(y.technical_profile).find(
          ([key]) => key === label,
        )?.[1] || "Sin información",
    ]),
    ...Object.entries(sensoryLabels).map(([key, label]) => [
      label,
      (y: YerbaMateDetail) => {
        const attribute = y.sensory_profile.attributes.find(
          (item) => item.attribute === key,
        );
        return attribute?.has_sufficient_evidence
          ? `${attribute.average} / 5 · ${attribute.evaluator_count} evaluadores`
          : "Sin evidencia suficiente";
      },
    ]),
  ] as [string, (yerba: YerbaMateDetail) => string][];
  return (
    <Page>
      <View
        style={{
          marginHorizontal: -theme.spacing.lg,
          marginTop: -theme.spacing.lg,
        }}
      >
        <EditorialHero
          title="Elegí conociendo"
          accent="cada diferencia"
          description="Orígenes, estilos y perfiles. Compará las yerbas a tu manera."
          compact
        />
      </View>
      <Body>
        Elegí entre dos y cuatro yerbas y compará sus características.
      </Body>
      {slugs.length < 2 && (
        <Card>
          <Title>Elegí al menos dos yerbas</Title>
          <Button
            label="Explorar catálogo"
            onPress={() => router.push("/explorar")}
          />
        </Card>
      )}
      {queries.map((query, index) => (
        <Card key={slugs[index]}>
          <QueryState query={query}>
            {query.data && (
              <>
                <Title>{query.data.name}</Title>
                <Button
                  label="Ver ficha"
                  secondary
                  onPress={() =>
                    router.push({
                      pathname: "/yerbas/[slug]",
                      params: { slug: slugs[index] },
                    })
                  }
                />
              </>
            )}
          </QueryState>
          <Button
            label="Quitar"
            secondary
            onPress={() => toggle(slugs[index])}
          />
        </Card>
      ))}
      {ready && (
        <>
          <Title>Comparación</Title>
          <Body muted>Deslizá hacia los lados para ver todas las yerbas.</Body>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={{ flexDirection: "row" }}>
                {[
                  "Característica",
                  ...queries.map((query) => query.data!.name),
                ].map((name, index) => (
                  <View
                    key={index}
                    style={{
                      width: 190,
                      padding: theme.spacing.md,
                      backgroundColor: theme.colors.sage,
                    }}
                  >
                    <Text style={styles.title}>{name}</Text>
                  </View>
                ))}
              </View>
              {rows.map(([label, value]) => {
                const values = queries.map((query) => value(query.data!));
                const differs = new Set(values).size > 1;
                return (
                  <View key={label} style={{ flexDirection: "row" }}>
                    {[label, ...values].map((cell, index) => (
                      <View
                        key={index}
                        style={{
                          width: 190,
                          padding: theme.spacing.md,
                          borderBottomWidth: 1,
                          borderColor: theme.colors.border,
                          backgroundColor: differs
                            ? theme.colors.sage
                            : theme.colors.surface,
                        }}
                      >
                        {index > 0 &&
                        label === "Promedio" &&
                        queries[index - 1].data!.stats.rating_average !==
                          null ? (
                          <View style={{ gap: theme.spacing.xs }}>
                            <LeafRating
                              value={
                                queries[index - 1].data!.stats.rating_average
                              }
                              size={16}
                            />
                            <Body muted>
                              {queries[index - 1].data!.stats.review_count}{" "}
                              opiniones
                            </Body>
                          </View>
                        ) : index > 0 &&
                          Object.values(sensoryLabels).includes(
                            label as (typeof sensoryLabels)[keyof typeof sensoryLabels],
                          ) &&
                          queries[
                            index - 1
                          ].data!.sensory_profile.attributes.some(
                            (a) =>
                              sensoryLabels[a.attribute] === label &&
                              a.has_sufficient_evidence &&
                              a.average !== null,
                          ) ? (
                          <LeafRating
                            value={
                              queries[
                                index - 1
                              ].data!.sensory_profile.attributes.find(
                                (a) => sensoryLabels[a.attribute] === label,
                              )!.average
                            }
                            label={label}
                            size={16}
                          />
                        ) : (
                          <Body>{cell}</Body>
                        )}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <Body muted>
            Las filas resaltadas muestran diferencias. Los valores desconocidos
            se conservan como tales.
          </Body>
        </>
      )}
      {slugs.length > 0 && (
        <Button label="Limpiar comparación" secondary onPress={clear} />
      )}
    </Page>
  );
}
