import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { AuthSheet, AuthField } from "@/components/auth-sheet";
import { Body, Button, ErrorMessage } from "@/components/ui";
import { useSession } from "@/providers/session";
import { write, normalizeError } from "@/api/client";
import { tr, useLocale } from "@/i18n";

export function YerbaSuggestion() {
  useLocale();
  const params = useLocalSearchParams<{ name?: string; brand?: string }>();
  const { user, ready } = useSession();
  const [name, setName] = useState((params.name || "").slice(0, 150));
  const [brand, setBrand] = useState((params.brand || "").slice(0, 150));
  const mutation = useMutation({
    mutationFn: () =>
      write("yerba-suggestions/", "POST", {
        name: name.trim(),
        brand: brand.trim(),
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
            disabled={mutation.isPending || !name.trim() || !brand.trim()}
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
