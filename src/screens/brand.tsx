import { BrandFollow } from "@/components/brand-follow";
import { tr, useLocale } from "@/i18n";
import { Text, View } from "react-native";
import { Icon } from "@/components/icon";
import { CountryFlag } from "@/components/country-flag";
import { useTheme } from "@/theme";
import { Stack, useLocalSearchParams } from "expo-router";
import { CatalogImage } from "@/components/catalog-image";
import { YerbaCardSkeletons } from "@/components/yerba-card-loading";
import {
  Page,
  Title,
  Body,
  Button,
  QueryState,
  ExternalLink,
  YerbaCard,
  countryLabel,
} from "@/components/ui";
import { useResource, usePages } from "@/hooks/queries";
import { BrandDetail, YerbaMateListItem } from "@/api/types";
export function Brand() {
  const theme = useTheme();
  useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const brand = useResource<BrandDetail>(`brands/${encodeURIComponent(slug)}/`);
  const yerbas = usePages<YerbaMateListItem>("yerbas/", { brand: slug });
  return (
    <Page>
      <Stack.Screen />
      <QueryState query={brand} skeleton="header">
        {brand.data && (
          <>
            <View style={{ gap: theme.spacing.md }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: theme.spacing.md,
                }}
              >
                {brand.data.image_url && (
                  <View
                    style={{
                      width: 112,
                      height: 112,
                      flexShrink: 0,
                      overflow: "hidden",
                      borderRadius: theme.radius.control,
                      backgroundColor: theme.colors.white,
                    }}
                  >
                    <CatalogImage
                      url={brand.data.image_url}
                      label={brand.data.image_alt_text || brand.data.name}
                      height={112}
                    />
                  </View>
                )}
                <View style={{ flex: 1, alignItems: "flex-start", gap: 10 }}>
                  <View
                    accessible
                    accessibilityLabel={
                      brand.data.is_verified
                        ? tr("{0}, marca verificada", { 0: brand.data.name })
                        : brand.data.name
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <Text
                      accessibilityRole="header"
                      style={{
                        color: theme.colors.ink,
                        fontFamily: theme.fonts.display,
                        fontSize: 25,
                        lineHeight: 30,
                      }}
                    >
                      {brand.data.name}
                    </Text>
                    {brand.data.is_verified && (
                      <Icon
                        name="verified"
                        size={20}
                        color={theme.colors.green}
                      />
                    )}
                    <CountryFlag
                      code={brand.data.country_code}
                      country={countryLabel(brand.data.country_code)}
                    />
                  </View>
                  {brand.data.website && (
                    <ExternalLink
                      label={tr("Sitio oficial")}
                      url={brand.data.website}
                    />
                  )}
                </View>
              </View>
              {brand.data.description && (
                <View style={{ paddingTop: theme.spacing.sm }}>
                  <Body>{brand.data.description}</Body>
                </View>
              )}
            </View>
          </>
        )}
      </QueryState>
      {brand.data && <BrandFollow slug={slug} />}
      <Title>{tr("Sus yerbas")}</Title>
      <QueryState
        query={yerbas}
        yerbaCards
        empty={yerbas.data?.pages[0]?.count === 0}
      >
        {yerbas.data?.pages
          .flatMap((p) => p.results)
          .map((item, index) => (
            <YerbaCard key={item.slug} yerba={item} index={index % 20} />
          ))}
      </QueryState>
      {yerbas.isFetchingNextPage && <YerbaCardSkeletons />}
      {yerbas.hasNextPage && (
        <Button
          label={tr("Más yerbas")}
          disabled={yerbas.isFetchingNextPage}
          onPress={() => {
            void yerbas.fetchNextPage();
          }}
        />
      )}
    </Page>
  );
}
