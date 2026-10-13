import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Page, QueryState, YerbaCard, styles } from "@/components/ui";
import { Paper, SearchBox, SectionHeading } from "@/components/editorial";
import { Icon } from "@/components/icon";
import { theme as t } from "@/theme";
import { usePages, useResource } from "@/hooks/queries";
import { YerbaMateListItem, PaginatedResponse, YerbaStyle } from "@/api/types";

export function Home() {
  const yerbas = usePages<YerbaMateListItem>("yerbas/");
  const taxonomy = useResource<PaginatedResponse<YerbaStyle>>("styles/");
  return (
    <Page safeTop>
      <View style={{ position: "relative", marginTop: t.spacing.md }}>
        <View
          style={{
            minHeight: 128,
            padding: t.spacing.md,
            paddingRight: 164,
            justifyContent: "center",
            backgroundColor: t.colors.green,
            borderRadius: t.radius.card,
            borderCurve: "continuous",
            overflow: "hidden",
            isolation: "isolate",
          }}
        >
          <Paper dark />
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                fontSize: 30,
                lineHeight: 32,
                textTransform: "uppercase",
                color: t.colors.cream,
              },
            ]}
          >
            Tu{"\n"}próxima{"\n"}
            <Text style={{ color: t.colors.lime }}>yerba.</Text>
          </Text>
        </View>
        <Image
          source={require("../../assets/images/mate-hero-inicio.webp")}
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            right: -8,
            bottom: 0,
          }}
          contentFit="contain"
          contentPosition="right"
          accessible={false}
        />
      </View>
      <SearchBox
        onSubmit={() =>
          router.push({ pathname: "/explorar", params: { mode: "search" } })
        }
        placeholder="Buscar yerbas o marcas…"
      />
      <View style={{ gap: 12 }}>
        <SectionHeading title="Explorá por estilo" />
        <QueryState query={taxonomy} empty={taxonomy.data?.count === 0}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {taxonomy.data?.results.map((style) => (
              <Pressable
                key={style.slug}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/explorar",
                    params: { style: style.slug },
                  })
                }
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  minHeight: 44,
                  borderRadius: t.radius.pill,
                  backgroundColor: t.colors.sage,
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={[styles.body, { fontSize: 14 }]}>
                  {style.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </QueryState>
      </View>
      <View style={{ gap: 16 }}>
        <SectionHeading
          title="Yerbas destacadas"
          action="Ver todas"
          onPress={() => router.push("/explorar")}
        />
        <QueryState
          query={yerbas}
          yerbaCards
          empty={yerbas.data?.pages[0]?.count === 0}
        >
          {yerbas.data?.pages[0]?.results.slice(0, 4).map((yerba, index) => (
            <YerbaCard key={yerba.slug} yerba={yerba} index={index} />
          ))}
        </QueryState>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Conocer la cultura matera"
        onPress={() => router.push("/editorial/cultura")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          minHeight: 64,
          borderTopWidth: 1,
          borderColor: t.colors.subtleBorder,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Icon name="book" />
        <Text style={[styles.body, { flex: 1 }]}>Cultura matera</Text>
        <Icon name="arrow" size={18} />
      </Pressable>
    </Page>
  );
}
