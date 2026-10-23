import { z } from "zod";
import { sensoryLabels, type SensoryKey } from "./community-types";

export const requiredReviewSensoryKeys: readonly SensoryKey[] = [
  "intensity",
  "bitterness",
  "perceived_dust",
];

export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1)
    .max(5)
    .refine(
      (value) => Number.isInteger(value * 2),
      "Elegí una puntuación en pasos de medio punto.",
    ),
  comment: z.string(),
  sensory: z
    .partialRecord(
      z.enum(Object.keys(sensoryLabels) as [SensoryKey, ...SensoryKey[]]),
      z.number().int().min(1).max(5).nullable(),
    )
    .superRefine((sensory, ctx) => {
      for (const key of requiredReviewSensoryKeys) {
        if (sensory[key] == null) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Elegí un valor de 1 a 5.",
          });
        }
      }
    }),
});
