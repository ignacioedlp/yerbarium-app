import { describe, expect, it } from "vitest";
import { reviewSchema, requiredReviewSensoryKeys } from "./review-validation";

const completeReview = {
  rating: 3.5,
  comment: "",
  sensory: {
    intensity: 1,
    bitterness: 5,
    perceived_dust: 2,
  },
};

describe("required review attributes", () => {
  it("accepts a review with all required scores and no optional details", () => {
    expect(reviewSchema.safeParse(completeReview).success).toBe(true);
  });

  it.each(requiredReviewSensoryKeys)("rejects missing or cleared %s", (key) => {
    for (const value of [undefined, null]) {
      const result = reviewSchema.safeParse({
        ...completeReview,
        sensory: { ...completeReview.sensory, [key]: value },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.map((issue) => issue.path)).toContainEqual([
          "sensory",
          key,
        ]);
      }
    }
  });

  it.each([0, 6, 2.5, "3"])("rejects invalid sensory score %s", (value) => {
    expect(
      reviewSchema.safeParse({
        ...completeReview,
        sensory: { ...completeReview.sensory, intensity: value },
      }).success,
    ).toBe(false);
  });

  it("rejects legacy reviews without sensory ratings when saved", () => {
    expect(
      reviewSchema.safeParse({ ...completeReview, sensory: {} }).success,
    ).toBe(false);
  });

  it("allows optional attributes to remain unevaluated", () => {
    expect(
      reviewSchema.safeParse({
        ...completeReview,
        sensory: {
          ...completeReview.sensory,
          astringency: null,
          smokiness: null,
          body: null,
          durability: null,
          clogging_tendency: null,
          brewing_ease: null,
        },
      }).success,
    ).toBe(true);
  });
});
