import { useState } from "react";
import { router } from "expo-router";
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ErrorMessage } from "./ui";
import { Pressable, Text, View } from "react-native";
import { Icon } from "./icon";
import { useTheme } from "@/theme";
import { useSession } from "@/providers/session";
import { write, normalizeError } from "@/api/client";
import type { Review } from "@/api/community-types";
import { tr, useLocale, getLocale } from "@/i18n";
import type { PaginatedResponse } from "@/api/types";
import type { SocialFeedEvent } from "@/api/social-feed";

type LikeableReview = Pick<Review, "id" | "liked_by_me" | "likes_count"> &
  Partial<Pick<Review, "status">>;
export function ReviewLike({ review }: { review: LikeableReview }) {
  const { user } = useSession();
  return <LikeControl key={user?.id ?? "guest"} review={review} />;
}
function LikeControl({ review }: { review: LikeableReview }) {
  const theme = useTheme();
  useLocale();
  const { user } = useSession();
  const client = useQueryClient();
  const [result, setResult] = useState<{
    liked_by_me: boolean;
    likes_count: number;
  }>();
  const unavailable =
    review.status !== undefined && review.status !== "PUBLISHED";
  const current = result ?? {
    liked_by_me: review.liked_by_me ?? false,
    likes_count: review.likes_count ?? 0,
  };
  const mutation = useMutation({
    mutationFn: () =>
      write<typeof current>(
        `reviews/${review.id}/like/`,
        current.liked_by_me ? "DELETE" : "PUT",
      ),
    onSuccess: async (data) => {
      setResult(data);
      client.setQueriesData<InfiniteData<PaginatedResponse<SocialFeedEvent>>>(
        { queryKey: ["private", "social", user?.username, "feed"] },
        (feed) =>
          feed && {
            ...feed,
            pages: feed.pages.map((page) => ({
              ...page,
              results: page.results.map((event) =>
                event.kind === "review" && event.review.id === review.id
                  ? { ...event, review: { ...event.review, ...data } }
                  : event,
              ),
            })),
          },
      );
      await client.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "private" &&
          !(q.queryKey[1] === "social" && q.queryKey[3] === "feed"),
      });
    },
  });
  return (
    <View style={{ alignSelf: "flex-start", flexShrink: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${current.liked_by_me ? tr("Quitar Me gusta") : tr("Me gusta")}: ${current.likes_count.toLocaleString(getLocale())}`}
        accessibilityState={{
          selected: current.liked_by_me,
          disabled: mutation.isPending || unavailable,
          busy: mutation.isPending,
        }}
        disabled={mutation.isPending || unavailable}
        onPress={() => (user ? mutation.mutate() : router.push("/ingresar"))}
        style={({ pressed }) => ({
          minHeight: 44,
          minWidth: 44,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          gap: 6,
          opacity: mutation.isPending || unavailable ? 0.5 : pressed ? 0.65 : 1,
        })}
      >
        <Icon name={current.liked_by_me ? "heartFilled" : "heart"} size={23} />
        <Text
          style={{
            fontFamily: theme.fonts.bold,
            fontSize: 16,
            color: theme.colors.green,
            fontVariant: ["tabular-nums"],
          }}
        >
          {current.likes_count.toLocaleString(getLocale())}
        </Text>
      </Pressable>
      {mutation.error && (
        <ErrorMessage message={normalizeError(mutation.error).message} />
      )}
    </View>
  );
}
