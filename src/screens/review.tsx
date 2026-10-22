import { tr, useLocale, getLocale } from "@/i18n";
import { FlavorNotePicker } from "@/components/flavor-note-picker";
import { LeafRating } from "@/components/leaf-rating";
import { Icon } from "@/components/icon";
import { EditorialHero } from "@/components/editorial";
import { theme } from "@/theme";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { get, write, normalizeError } from "@/api/client";
import {
  Review,
  FlavorNote,
  sensoryLabels,
  SensoryKey,
} from "@/api/community-types";
import { useSession } from "@/providers/session";
import { usePages } from "@/hooks/queries";
import {
  Page,
  Title,
  Body,
  Button,
  Card,
  Field,
  ErrorMessage,
  QueryState,
  RequireSession,
  useCanWrite,
} from "@/components/ui";
import { sensoryFields } from "@/api/sensory-fields";
const schema = z.object({
  rating: z
    .number()
    .min(1)
    .max(5)
    .refine(
      (value) => Number.isInteger(value * 2),
      "Elegí una puntuación en pasos de medio punto.",
    ),
  comment: z.string(),
});
function ReviewForm({ slug, review }: { slug: string; review: Review | null }) {
  useLocale();
  const online = useCanWrite(),
    client = useQueryClient();
  const notes = usePages<FlavorNote>("flavor-notes/");
  const [expanded, setExpanded] = useState(
    !!review?.comment || !!review?.sensory || !!review?.flavor_notes.length,
  );
  const [sensory, setSensory] = useState<
    Partial<Record<SensoryKey, number | null>>
  >(review?.sensory || {});
  const [selected, setSelected] = useState<string[]>(
    review?.flavor_notes.map((note) => note.slug) || [],
  );
  const [sensoryChanged, setSensoryChanged] = useState(false),
    [notesChanged, setNotesChanged] = useState(false);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: review ? Number(review.rating) : 3,
      comment: review?.comment || "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      write<Review>(
        review
          ? `reviews/${review.id}/`
          : `yerbas/${encodeURIComponent(slug)}/reviews/`,
        review ? "PATCH" : "POST",
        {
          rating: values.rating.toFixed(1),
          comment: values.comment,
          ...(sensoryChanged ? { sensory } : {}),
          ...(notesChanged ? { flavor_note_slugs: selected } : {}),
        },
      ),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({
          queryKey: ["private", "auth/me/gamification/"],
        }),
        client.invalidateQueries({ queryKey: ["private", "social"] }),
        client.invalidateQueries({
          queryKey: ["private", `auth/library/${encodeURIComponent(slug)}/`],
        }),
        client.invalidateQueries({ queryKey: ["private", "auth/library/"] }),
        client.invalidateQueries({
          queryKey: ["private", "auth/library/summary/"],
        }),
        client.invalidateQueries({
          queryKey: ["private", `yerbas/${slug}/reviews/`],
        }),
        client.invalidateQueries({ queryKey: ["public", `yerbas/${slug}/`] }),
        client.invalidateQueries({
          queryKey: ["public", `yerbas/${slug}/reviews/`],
        }),
        client.invalidateQueries({
          queryKey: ["private", `yerbas/${slug}/reviews/me/`],
        }),
        client.invalidateQueries({ queryKey: ["public", "yerbas/"] }),
        client.invalidateQueries({ queryKey: ["public", "search/"] }),
        client.invalidateQueries({
          queryKey: ["public", "community/rankings/yerbas/?limit=3"],
        }),
      ]);
      router.back();
    },
  });
  return (
    <>
      <Title>
        {review ? tr("Editá tu opinión") : tr("¿Cómo fue tu ronda?")}
      </Title>
      <Body>
        {tr("Una puntuación alcanza. Podés completar los detalles después.")}
      </Body>
      <Controller
        control={form.control}
        name="rating"
        render={({ field, fieldState }) => (
          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              <Title>{tr("Tu puntuación")}</Title>
              <Text
                accessibilityLiveRegion="polite"
                style={{
                  color: theme.colors.green,
                  fontFamily: theme.fonts.bold,
                  fontSize: 18,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {field.value.toLocaleString(getLocale(), {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                / 5
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: theme.spacing.sm,
              }}
            >
              {(["minus", "leaves", "plus"] as const).map((control) => {
                if (control === "leaves")
                  return (
                    <View
                      key={control}
                      accessible
                      accessibilityRole="adjustable"
                      accessibilityLabel={tr("Tu puntuación")}
                      accessibilityValue={{
                        min: 1,
                        max: 5,
                        now: field.value,
                        text: tr("{0} de 5", {
                          0: field.value.toLocaleString(getLocale()),
                        }),
                      }}
                      accessibilityActions={[
                        { name: "increment", label: tr("Subir medio punto") },
                        { name: "decrement", label: tr("Bajar medio punto") },
                      ]}
                      onAccessibilityAction={({ nativeEvent }) => {
                        if (nativeEvent.actionName === "increment")
                          field.onChange(Math.min(5, field.value + 0.5));
                        if (nativeEvent.actionName === "decrement")
                          field.onChange(Math.max(1, field.value - 0.5));
                      }}
                    >
                      <LeafRating
                        value={field.value}
                        showValue={false}
                        size={26}
                      />
                    </View>
                  );
                const decrease = control === "minus";
                const disabled = decrease ? field.value <= 1 : field.value >= 5;
                return (
                  <Pressable
                    key={control}
                    accessibilityRole="button"
                    accessibilityLabel={
                      decrease
                        ? tr("Bajar puntuación medio punto")
                        : tr("Subir puntuación medio punto")
                    }
                    accessibilityState={{ disabled }}
                    disabled={disabled}
                    onPress={() =>
                      field.onChange(
                        Math.max(
                          1,
                          Math.min(5, field.value + (decrease ? -0.5 : 0.5)),
                        ),
                      )
                    }
                    style={({ pressed }) => ({
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: theme.radius.pill,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
                    })}
                  >
                    <Icon name={control} size={24} />
                  </Pressable>
                );
              })}
            </View>
            {fieldState.error && (
              <ErrorMessage
                message={
                  fieldState.error.message || tr("Revisá la puntuación.")
                }
              />
            )}
          </Card>
        )}
      />
      <Button
        label={expanded ? tr("Ocultar detalles") : tr("¿Querés contar más?")}
        secondary
        onPress={() => setExpanded(!expanded)}
      />
      {expanded && (
        <>
          <Controller
            control={form.control}
            name="comment"
            render={({ field }) => (
              <Field
                label={tr("Tu comentario (opcional)")}
                multiline
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
          <Title>{tr("Evaluación sensorial")}</Title>
          <Body muted>
            {tr(
              "Usá 1 para el nivel más bajo y 5 para el más alto. No evaluar deja el atributo sin valoración.",
            )}
          </Body>
          {(Object.keys(sensoryLabels) as SensoryKey[]).map((key) => (
            <Card key={key}>
              <Body>{tr(sensoryLabels[key])}</Body>
              <Body muted>
                {tr(
                  sensoryFields.find((field) => field.key === key)?.help || "",
                )}
              </Body>
              <LeafRating
                value={sensory[key] ?? null}
                label={tr(sensoryLabels[key])}
                size={30}
                onChange={(value) => {
                  setSensory((current) => ({ ...current, [key]: value }));
                  setSensoryChanged(true);
                }}
              />
              {(sensory[key] ?? null) !== null && (
                <Body muted>
                  {tr(
                    sensoryFields.find((field) => field.key === key)?.levels[
                      sensory[key]! - 1
                    ] || "",
                  )}
                </Body>
              )}
              <Button
                compact
                secondary
                label={tr("No evaluar")}
                selected={(sensory[key] ?? null) === null}
                onPress={() => {
                  setSensory((current) => ({ ...current, [key]: null }));
                  setSensoryChanged(true);
                }}
              />
            </Card>
          ))}
          <Title>{tr("Notas que percibiste")}</Title>
          <Body muted>
            {tr("Podés seleccionar varias, aunque no evalúes ningún atributo.")}
          </Body>
          <QueryState query={notes}>
            <FlavorNotePicker
              notes={notes.data?.pages.flatMap((page) => page.results) ?? []}
              selected={selected}
              disabled={mutation.isPending}
              onToggle={(slug) => {
                setSelected((current) =>
                  current.includes(slug)
                    ? current.filter((value) => value !== slug)
                    : [...current, slug],
                );
                setNotesChanged(true);
              }}
            />
          </QueryState>
          {notes.hasNextPage && (
            <Button
              label={tr("Más notas")}
              secondary
              disabled={notes.isFetchingNextPage}
              onPress={() => {
                void notes.fetchNextPage();
              }}
            />
          )}
          <Button
            compact
            secondary
            label={tr("Limpiar notas")}
            disabled={!selected.length || mutation.isPending}
            onPress={() => {
              setSelected([]);
              setNotesChanged(true);
            }}
          />
        </>
      )}
      {mutation.error && (
        <ErrorMessage message={normalizeError(mutation.error).message} />
      )}
      <Button
        label={
          mutation.isPending
            ? tr("Guardando…")
            : review
              ? tr("Guardar opinión")
              : tr("Publicar opinión")
        }
        disabled={!online || mutation.isPending}
        onPress={form.handleSubmit((values) => mutation.mutate(values))}
      />
      <Button
        label={tr("Cancelar")}
        secondary
        disabled={mutation.isPending}
        onPress={() => router.back()}
      />
    </>
  );
}
export function ReviewScreen() {
  useLocale();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useSession();
  const own = useQuery({
    queryKey: ["private", `yerbas/${slug}/reviews/me/`],
    enabled: !!user,
    queryFn: async ({ signal }) => {
      try {
        return await get<Review>(
          `yerbas/${encodeURIComponent(slug)}/reviews/me/`,
          undefined,
          signal,
          true,
        );
      } catch (error) {
        if (normalizeError(error).status === 404) return null;
        throw error;
      }
    },
  });
  return (
    <Page>
      <View
        style={{
          marginHorizontal: -theme.spacing.lg,
          marginTop: -theme.spacing.lg,
        }}
      >
        <EditorialHero
          title={tr("Tu experiencia")}
          accent={tr("suma a la ronda")}
          description={tr("Cada opinión ayuda a conocer mejor una yerba.")}
          compact
        />
      </View>
      <RequireSession bare>
        <QueryState query={own}>
          {own.data !== undefined && (
            <ReviewForm slug={slug} review={own.data} />
          )}
        </QueryState>
      </RequireSession>
    </Page>
  );
}
