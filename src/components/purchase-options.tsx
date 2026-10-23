import { tr, getLocale, useLocale } from "@/i18n";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { YerbaPurchaseLink } from "@/api/types";
import { Body, ErrorMessage, openExternal } from "@/components/ui";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme";
import { trackAnalyticsEvent } from "@/analytics";

export function PurchaseOptions({
  slug,
  links,
}: {
  slug: string;
  links: YerbaPurchaseLink[];
}) {
  const t = useTheme();
  useLocale();
  const [failedLink, setFailedLink] = useState<number | null>(null);
  return (
    <View
      style={{
        gap: t.spacing.sm,
        borderTopWidth: 1,
        borderColor: t.colors.border,
        paddingTop: t.spacing.md,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{ fontFamily: t.fonts.bold, fontSize: 20, color: t.colors.ink }}
      >
        {tr("Dónde comprar")}
      </Text>
      <Body muted>
        {tr(
          "Vas a una tienda externa. Confirmá el precio y la disponibilidad antes de comprar.",
        )}
      </Body>
      {[...links]
        .sort((a, b) => a.priority - b.priority || a.id - b.id)
        .map((link) => (
          <View key={link.id}>
            <Pressable
              accessibilityRole="link"
              accessibilityHint={tr("Abre la tienda en el navegador")}
              onPress={() => {
                setFailedLink(null);
                trackAnalyticsEvent("purchase_provider_clicked", {
                  yerba_slug: slug,
                  provider: link.provider,
                  purchase_link_id: link.id,
                  is_affiliate: Boolean(link.affiliate_url),
                });
                void openExternal(link.affiliate_url || link.url).catch(() =>
                  setFailedLink(link.id),
                );
              }}
              style={({ pressed }) => ({
                minHeight: 48,
                paddingVertical: t.spacing.md,
                flexDirection: "row",
                alignItems: "center",
                gap: t.spacing.sm,
                borderBottomWidth: 1,
                borderColor: t.colors.subtleBorder,
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <View style={{ flex: 1, gap: t.spacing.xs }}>
                <Text
                  style={{
                    fontFamily: t.fonts.bold,
                    fontSize: 17,
                    color: t.colors.green,
                  }}
                >
                  {link.provider}
                </Text>
                {link.is_official && <Body muted>{tr("Tienda oficial")}</Body>}
                {link.price !== null && (
                  <Body muted>
                    {new Intl.NumberFormat(getLocale(), {
                      style: "currency",
                      currency: link.currency,
                      currencyDisplay: "code",
                    }).format(Number(link.price))}
                  </Body>
                )}
              </View>
              <Icon name="external" size={20} />
            </Pressable>
            {failedLink === link.id && (
              <ErrorMessage
                message={tr(
                  "No pudimos abrir la tienda. Volvé a tocar el enlace para intentarlo de nuevo.",
                )}
              />
            )}
          </View>
        ))}
      {links.some((link) => link.affiliate_url) && (
        <Body muted>
          {tr(
            "Algunos enlaces son de afiliados. Yerbarium puede recibir una comisión por tu compra.",
          )}
        </Body>
      )}
    </View>
  );
}
