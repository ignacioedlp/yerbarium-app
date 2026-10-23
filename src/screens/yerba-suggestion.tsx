import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";
import { AuthSheet, AuthField } from "@/components/auth-sheet";
import { Body, Button, ErrorMessage } from "@/components/ui";
import { useSession } from "@/providers/session";
import { normalizeError } from "@/api/client";
import { suggestYerba, validSuggestionWeight } from "@/api/yerba-suggestions";
import { tr, useLocale } from "@/i18n";
import { useTheme } from "@/theme";

export function YerbaSuggestion() {
  const t = useTheme();
  useLocale();
  const params = useLocalSearchParams<{
    name?: string;
    brand?: string;
    barcode?: string;
  }>();
  const { user, ready } = useSession();
  const [name, setName] = useState((params.name || "").slice(0, 150));
  const [brand, setBrand] = useState((params.brand || "").slice(0, 150));
  const [weight, setWeight] = useState("");
  const validWeight = validSuggestionWeight(weight);
  const mutation = useMutation({
    mutationFn: () =>
      suggestYerba({
        name,
        brand,
        barcode: params.barcode,
        weight,
      }),
  });
  const success = mutation.isSuccess;
  return (
    <AuthSheet
      title={tr(
        success ? "¡Gracias por tu sugerencia!" : "¿Qué yerba nos falta?",
      )}
      description={tr(
        success
          ? "Revisaremos tu sugerencia. Gracias por ayudarnos a completar el catálogo."
          : "Contanos el nombre y la marca de la yerba que te gustaría encontrar.",
      )}
      pending={mutation.isPending}
      actions={
        success ? (
          <Button label={tr("Listo")} onPress={() => router.back()} />
        ) : user ? (
          <Button
            label={tr(mutation.isPending ? "Enviando…" : "Enviar sugerencia")}
            disabled={
              mutation.isPending ||
              !name.trim() ||
              !brand.trim() ||
              !validWeight
            }
            onPress={() => mutation.mutate()}
          />
        ) : (
          <Button
            label={tr("Iniciar sesión")}
            disabled={!ready}
            onPress={() => router.push("/ingresar")}
          />
        )
      }
    >
      {!success &&
        (user ? (
          <>
            <AuthField
              label={tr("Nombre de la yerba")}
              value={name}
              onChangeText={setName}
              maxLength={150}
              editable={!mutation.isPending}
              autoCapitalize="words"
            />
            <AuthField
              label={tr("Marca")}
              value={brand}
              onChangeText={setBrand}
              maxLength={150}
              editable={!mutation.isPending}
              autoCapitalize="words"
            />
            <View style={{ gap: t.spacing.sm }}>
              <Text
                style={{
                  fontFamily: t.fonts.bold,
                  fontSize: 15,
                  color: t.colors.ink,
                }}
              >
                {tr("Peso (opcional)")}
              </Text>
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel={tr("Peso (opcional)")}
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: t.spacing.sm,
                }}
              >
                {[
                  ["", tr("Sin especificar")],
                  ["250", "250 g"],
                  ["500", "500 g"],
                  ["1000", "1 kg"],
                  ["2000", "2 kg"],
                ].map(([value, label]) => {
                  const checked = weight === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityLabel={label}
                      accessibilityState={{
                        checked,
                        disabled: mutation.isPending,
                      }}
                      disabled={mutation.isPending}
                      testID={`suggestion-weight-${value || "none"}`}
                      onPress={() => setWeight(value)}
                      style={({ pressed }) => ({
                        minHeight: 44,
                        paddingHorizontal: t.spacing.md,
                        paddingVertical: t.spacing.sm,
                        justifyContent: "center",
                        borderRadius: t.radius.pill,
                        borderWidth: 1,
                        borderColor: checked ? t.colors.green : t.colors.border,
                        backgroundColor: checked
                          ? t.colors.selected
                          : t.colors.surface,
                        opacity: mutation.isPending ? 0.45 : pressed ? 0.65 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontFamily: checked ? t.fonts.bold : t.fonts.body,
                          fontSize: 16,
                          color: t.colors.ink,
                        }}
                      >
                        {checked ? "✓ " : ""}
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <Body>
            {tr(
              "Iniciá sesión para enviar tu sugerencia. Así sabremos a quién agradecerle.",
            )}
          </Body>
        ))}
      {mutation.error && (
        <ErrorMessage
          message={
            normalizeError(mutation.error).status === 401
              ? tr("Tu sesión venció. Volvé a iniciar sesión.")
              : tr("No pudimos enviar la sugerencia. Intentá nuevamente.")
          }
        />
      )}
    </AuthSheet>
  );
}
