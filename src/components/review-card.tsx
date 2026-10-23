import { tr, useLocale, getLocale } from "@/i18n";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme";
import { LeafRating } from "@/components/leaf-rating";
import { router } from "expo-router";
import { Body, Card } from "./ui";
import { Review, sensoryLabels } from "@/api/community-types";
import { ReviewLike } from "./review-like";
export function ReviewCard({ review }: { review: Review }) {
  const theme = useTheme();
  useLocale();
  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`@${review.username}`}
          onPress={() =>
            router.push({
              pathname: "/usuarios/[username]",
              params: { username: review.username },
            })
          }
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 44,
            justifyContent: "center",
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: theme.fonts.bold,
              fontSize: 17,
              color: theme.colors.green,
            }}
          >
            @{review.username}
          </Text>
        </Pressable>
        <ReviewLike
          key={`${review.id}-${review.liked_by_me}-${review.likes_count}`}
          review={review}
        />
      </View>
      <LeafRating value={review.rating} size={28} fullWidth />
      {review.comment ? <Body>{review.comment}</Body> : null}
      {review.sensory &&
        Object.entries(review.sensory)
          .filter(([, value]) => value !== null)
          .map(([key, value]) => (
            <View key={key} style={{ gap: 4 }}>
              <Body muted>
                {tr(sensoryLabels[key as keyof typeof sensoryLabels])}
              </Body>
              <LeafRating
                label={tr(sensoryLabels[key as keyof typeof sensoryLabels])}
                value={value!}
                size={26}
                fullWidth
              />
            </View>
          ))}
      {review.flavor_notes.length > 0 && (
        <Body muted>
          {review.flavor_notes.map((note) => tr(note.name)).join(" · ")}
        </Body>
      )}
      <Body muted>
        {new Date(review.created_at).toLocaleDateString(getLocale())}
      </Body>
    </Card>
  );
}
