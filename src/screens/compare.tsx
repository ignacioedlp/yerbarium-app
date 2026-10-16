import { tr, countLabel, getLocale, useLocale } from "@/i18n";
import { LeafRating } from "@/components/leaf-rating";
import { useQueries } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScrollView, View, Text } from "react-native";
import { Page, Title, Body, Button, Card, QueryState } from "@/components/ui";
import { useComparison } from "@/providers/comparison";
import { get } from "@/api/client";
import { technicalRows } from "@/api/format";
import { YerbaMateDetail } from "@/api/types";
import { sensoryLabels } from "@/api/community-types";
import { theme } from "@/theme";
import { EditorialHero } from "@/components/editorial";
export function Compare() {
  useLocale();
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
        y.styles.map((style) => tr(style.name)).join(" · ") ||
        "Sin información",
    ],
    [
      "Promedio",
      (y: YerbaMateDetail) =>
        y.stats.rating_average
          ? `${Number(y.stats.rating_average).toLocaleString(getLocale())} / 5 (${y.stats.review_count})`
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
          ([key]) => key === tr(label),
        )?.[1] || "Sin información",
    ]),
    ...Object.entries(sensoryLabels).map(([key, label]) => [
      label,
      (y: YerbaMateDetail) => {
        const attribute = y.sensory_profile.attributes.find(
          (item) => item.attribute === key,
        );
        return attribute?.has_sufficient_evidence
          ? tr("{0} / 5 · {1} evaluadores", {
              0: attribute.average,
              1: attribute.evaluator_count,
            })
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
          title={tr("Elegí conociendo")}
          accent={tr("cada diferencia")}
          description={tr(
            "Orígenes, estilos y perfiles. Compará las yerbas a tu manera.",
          )}
          compact
        />
      </View>
      <Body>
        {tr("Elegí entre dos y cuatro yerbas y compará sus características.")}
      </Body>
      {slugs.length < 2 && (
        <Card>
          <Title>{tr("Elegí al menos dos yerbas")}</Title>
          <Button
            label={tr("Explorar catálogo")}
            onPress={() => router.push("/explorar")}
          />
        </Card>
      )}

      {ready && (
        <>
          <Title>{tr("Comparación")}</Title>
          <Body muted>
            {tr("Deslizá hacia los lados para ver todas las yerbas.")}
          </Body>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View
              style={{
                overflow: "hidden",
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.card,
                backgroundColor: theme.colors.surface,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 2,
                  borderColor: theme.colors.border,
                }}
              >
                {[
                  tr("Característica"),
                  ...queries.map((query) => query.data!.name),
                ].map((name, index) => (
                  <View
                    key={index}
                    style={{
                      width: index === 0 ? 132 : 176,
                      minHeight: 72,
                      justifyContent: "center",
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      backgroundColor:
                        index === 0 ? theme.colors.green : theme.colors.sage,
                      borderRightWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: theme.fonts.display,
                        fontSize: index === 0 ? 13 : 18,
                        lineHeight: index === 0 ? 17 : 22,
                        letterSpacing: 0.2,
                        textTransform: "uppercase",
                        color:
                          index === 0 ? theme.colors.cream : theme.colors.ink,
                        flexShrink: 1,
                      }}
                      numberOfLines={2}
                    >
                      {index === 0 ? tr(name) : name}
                    </Text>
                  </View>
                ))}
              </View>
              {rows.map(([label, value]) => {
                const values = queries.map((query) => value(query.data!));
                const differs = new Set(values).size > 1;
                return (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    {[label, ...values].map((cell, index) => (
                      <View
                        key={index}
                        style={{
                          width: index === 0 ? 132 : 176,
                          minHeight: 60,
                          justifyContent: "center",
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                          borderColor: theme.colors.border,
                          borderRightWidth: 1,
                          backgroundColor: differs
                            ? index === 0
                              ? theme.colors.selected
                              : theme.colors.sage
                            : index === 0
                              ? theme.colors.cream
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
                              {countLabel(
                                queries[index - 1].data!.stats.review_count,
                                "{count} opinión",
                                "{count} opiniones",
                              )}
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
                            label={tr(label)}
                            size={16}
                          />
                        ) : (
                          <Text
                            style={{
                              fontFamily:
                                index === 0
                                  ? theme.fonts.bold
                                  : theme.fonts.body,
                              fontSize: index === 0 ? 13 : 15,
                              lineHeight: 20,
                              color: theme.colors.ink,
                              flexShrink: 1,
                            }}
                          >
                            {index > 0 && label === "Marca" ? cell : tr(cell)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
          <Body muted>
            {tr(
              "Las filas resaltadas muestran diferencias. Los valores desconocidos se conservan como tales.",
            )}
          </Body>
        </>
      )}
      {queries.map((query, index) => (
        <Card key={slugs[index]}>
          <QueryState query={query}>
            {query.data && (
              <>
                <Title>{query.data.name}</Title>
                <Button
                  label={tr("Ver ficha")}
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
            label={tr("Quitar")}
            secondary
            onPress={() => toggle(slugs[index])}
          />
        </Card>
      ))}
      {slugs.length > 0 && (
        <Button label={tr("Limpiar comparación")} secondary onPress={clear} />
      )}
    </Page>
  );
}
