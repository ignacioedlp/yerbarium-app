import { Stack, router, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Page, Title, Body, Button } from "@/components/ui";
import { EditorialSourceLink } from "@/components/editorial-source-link";
import {
  EditorialHero,
  SectionHeading,
  HandNote,
} from "@/components/editorial";
import { theme as t } from "@/theme";
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
