import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { tr, useLocale } from "@/i18n";
import { Body, Button, QueryState } from "@/components/ui";
import { useSocialResource } from "@/hooks/follows";
import { useBrandFollow } from "@/hooks/brand-follows";
import { useSession } from "@/providers/session";
import type { BrandFollowState } from "@/api/brand-follows";
import { theme } from "@/theme";

export function BrandFollow({ slug }: { slug: string }) {
  useLocale();
  const { user } = useSession();
  const state = useSocialResource<BrandFollowState>(
    `brands/${encodeURIComponent(slug)}/follow/`,
  );
  const mutation = useBrandFollow(slug);
  return (
    <QueryState query={state}>
      <View style={{ gap: theme.spacing.sm }}>
        <Body>
          {state.data?.followers_count ?? 0} {tr("seguidores")}
        </Body>
        <Button
          label={tr(state.data?.is_following ? "Siguiendo" : "Seguir marca")}
          disabled={mutation.isPending || !state.data}
          onPress={() => {
            if (!user) router.push("/ingresar");
            else if (!mutation.isPending)
              mutation.mutate(!state.data?.is_following);
          }}
        />
        {mutation.error ? <Body>{mutation.error.message}</Body> : null}
      </View>
    </QueryState>
  );
}
