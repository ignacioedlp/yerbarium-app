import { View } from "react-native";
import { LeafRating } from "@/components/leaf-rating";
import { router } from "expo-router";
import { Body, Button, Card } from "./ui";
import { Review, sensoryLabels } from "@/api/community-types";
export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card>
      <Button
        label={`@${review.username}`}
        secondary
        onPress={() =>
          router.push({
            pathname: "/usuarios/[username]",
            params: { username: review.username },
          })
        }
      />
      <LeafRating value={review.rating} />
      {review.comment ? <Body>{review.comment}</Body> : null}
      {review.sensory &&
        Object.entries(review.sensory)
          .filter(([, value]) => value !== null)
          .map(([key, value]) => (
            <View key={key} style={{ gap: 4 }}>
              <Body muted>
                {sensoryLabels[key as keyof typeof sensoryLabels]}
              </Body>
              <LeafRating
                label={sensoryLabels[key as keyof typeof sensoryLabels]}
                value={value!}
              />
            </View>
          ))}
      {review.flavor_notes.length > 0 && (
        <Body muted>
          {review.flavor_notes.map((note) => note.name).join(" · ")}
        </Body>
      )}
      <Body muted>
        {new Date(review.created_at).toLocaleDateString("es-AR")}
      </Body>
    </Card>
  );
}
