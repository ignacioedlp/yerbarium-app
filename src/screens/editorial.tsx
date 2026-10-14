import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Page, Title, Body, Button } from "@/components/ui";
import { EditorialSourceLink } from "@/components/editorial-source-link";
import {
  EditorialHero,
  SectionHeading,
  HandNote,
} from "@/components/editorial";
import { theme as t } from "@/theme";
import { Icon } from "@/components/icon";
import { articles, learningLinks } from "@/content/learning";
export function Editorial() {
  const { article } = useLocalSearchParams<{ article: string }>();
  const data = articles[article];
  const isGuide =
    article === "como-preparar-un-mate" || article === "como-curar-un-mate";
  const preparing = article === "como-preparar-un-mate";
  if (!data)
    return (
      <Page>
        <Title>Artículo no encontrado</Title>
      </Page>
    );
  return (
    <Page fullBleed>
      <Stack.Screen options={{ title: data.title }} />
      <EditorialHero
        title={
          isGuide
            ? preparing
              ? "Cómo preparar"
              : "Cómo curar"
            : article === "cultura"
              ? "Más que una bebida,"
              : "De la planta"
        }
        accent={
          isGuide
            ? "un mate"
            : article === "cultura"
              ? "una cultura"
              : "a tu mate"
        }
        description={data.introduction}
      >
        {isGuide && (
          <Image
            source={require("../../assets/images/mate-hero-inicio.webp")}
            contentFit="cover"
            contentPosition="right center"
            style={{ height: 190, borderRadius: t.radius.card }}
            accessibilityLabel="Mate con bombilla entre hojas de yerba mate"
          />
        )}
      </EditorialHero>
      <View style={{ padding: t.spacing.lg, gap: t.spacing.lg }}>
        {!isGuide && (
          <Image
            source={
              article === "cultura"
                ? require("../../assets/images/cultura.webp")
                : require("../../assets/images/yerba-fields.webp")
            }
            contentFit="cover"
            style={{ height: 240, borderRadius: t.radius.card }}
            accessibilityLabel={
              article === "cultura"
                ? "Paisaje de cultivo de yerba mate"
                : "Yerbales y su territorio"
            }
          />
        )}
        <HandNote>
          {isGuide
            ? preparing
              ? "Tu mate, tu manera"
              : "El cuidado empieza adentro"
            : article === "cultura"
              ? "Territorio, personas, tradición."
              : "Conocer la yerba, disfrutar la ronda."}
        </HandNote>
        {data.sections.map((section) => (
          <View
            key={section.id}
            style={{
              gap: t.spacing.md,
              paddingVertical: t.spacing.md,
              borderBottomWidth: 1,
              borderColor: t.colors.subtleBorder,
            }}
          >
            <SectionHeading title={section.title} />
            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                selectable
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: 17,
                  lineHeight: 28,
                  color: t.colors.ink,
                }}
              >
                {paragraph}
              </Text>
            ))}
            {section.styleGuides && (
              <View style={{ borderTopWidth: 1, borderColor: t.colors.subtleBorder }}>
                {section.styleGuides.map((style) => (
                  <Pressable
                    key={style.slug}
                    accessibilityRole="button"
                    accessibilityLabel={`Explorar estilo ${style.name}`}
                    accessibilityHint="Abre el catálogo filtrado por este estilo"
                    onPress={() =>
                      router.push({
                        pathname: "/explorar",
                        params: { style: style.slug },
                      })
                    }
                    style={({ pressed }) => ({
                      gap: t.spacing.xs,
                      minHeight: 72,
                      paddingVertical: t.spacing.md,
                      borderBottomWidth: 1,
                      borderColor: t.colors.subtleBorder,
                      opacity: pressed ? 0.68 : 1,
                    })}
                  >
                    <View
                      style={{
                        minHeight: 28,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: t.spacing.sm,
                      }}
                    >
                      <Text
                        accessibilityRole="header"
                        style={{
                          fontFamily: t.fonts.display,
                          fontSize: 21,
                          lineHeight: 27,
                          color: t.colors.green,
                        }}
                      >
                        {style.name}
                      </Text>
                      <Icon name="arrow" size={18} />
                    </View>
                    <Text
                      selectable
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: 15,
                        lineHeight: 23,
                        color: t.colors.ink,
                      }}
                    >
                      {style.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            {section.notes?.map((note) => (
              <Body key={note} muted>
                {note}
              </Body>
            ))}
            {section.materials?.map((material) => (
              <View key={material.title} style={{ gap: t.spacing.xs }}>
                <Text
                  accessibilityRole="header"
                  style={{
                    fontFamily: t.fonts.bold,
                    fontSize: 18,
                    color: t.colors.green,
                  }}
                >
                  {material.title}
                </Text>
                <Body>{material.copy}</Body>
              </View>
            ))}
            {section.steps?.map((step, index) => (
              <View
                key={step.title}
                style={{
                  padding: t.spacing.md,
                  gap: t.spacing.sm,
                  borderWidth: 1,
                  borderColor: t.colors.subtleBorder,
                  borderRadius: t.radius.card,
                }}
              >
                <Text
                  accessibilityRole="header"
                  style={{
                    fontFamily: t.fonts.bold,
                    fontSize: 18,
                    color: t.colors.green,
                  }}
                >
                  {String(index + 1).padStart(2, "0")} · {step.title}
                </Text>
                <Body>{step.copy}</Body>
              </View>
            ))}
          </View>
        ))}
        <SectionHeading title="Fuentes" />
        <View>
          {data.sources.map((source, index) => (
            <EditorialSourceLink key={index} {...source} />
          ))}
        </View>
        <SectionHeading title="Seguir aprendiendo" />
        {learningLinks
          .filter((link) => link.article !== article)
          .map((link) => (
            <Button
              key={link.article}
              label={link.label}
              secondary
              fullWidth
              onPress={() =>
                router.push({
                  pathname: "/editorial/[article]",
                  params: { article: link.article },
                })
              }
            />
          ))}
      </View>
    </Page>
  );
}
