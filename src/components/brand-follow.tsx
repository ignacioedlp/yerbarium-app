import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { router } from "expo-router";
import { tr, useLocale } from "@/i18n";
import { Body, QueryState } from "@/components/ui";
import { useSocialResource } from "@/hooks/follows";
import { useBrandFollow } from "@/hooks/brand-follows";
import { useSession } from "@/providers/session";
import type { BrandFollowState } from "@/api/brand-follows";
import { Icon } from "@/components/icon";
import { useTheme } from "@/theme";

export function BrandFollow({
  slug,
  children,
}: React.PropsWithChildren<{ slug: string }>) {
  const theme = useTheme();
  useLocale();
  const { user } = useSession();
  const state = useSocialResource<BrandFollowState>(
    `brands/${encodeURIComponent(slug)}/follow/`,
  );
  const mutation = useBrandFollow(slug);
  return (
    <QueryState query={state}>
      <View style={{ gap: theme.spacing.sm }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.sm,
            alignSelf: "stretch",
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            {children}
            <Body muted>
              {state.data?.followers_count ?? 0}{" "}
              {tr(
                state.data?.followers_count === 1 ? "seguidor" : "seguidores",
              )}
            </Body>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr(
              state.data?.is_following ? "Dejar de seguir" : "Seguir marca",
            )}
            accessibilityState={{
              selected: !!state.data?.is_following,
              disabled: mutation.isPending || !state.data,
            }}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: theme.radius.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: state.data?.is_following
                ? theme.colors.selected
                : "transparent",
              borderWidth: state.data?.is_following ? 0 : 1,
              borderColor: theme.colors.border,
              opacity:
                mutation.isPending || !state.data ? 0.45 : pressed ? 0.65 : 1,
            })}
            disabled={mutation.isPending || !state.data}
            onPress={() => {
              if (!user) router.push("/ingresar");
              else if (!mutation.isPending)
                mutation.mutate(!state.data?.is_following);
            }}
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color={theme.colors.green} />
            ) : (
              <Icon
                name={state.data?.is_following ? "personCheck" : "personPlus"}
                size={22}
              />
            )}
          </Pressable>
        </View>
        {mutation.error ? <Body>{mutation.error.message}</Body> : null}
      </View>
    </QueryState>
  );
}
