import { get } from "./client";

export interface GamificationBadge {
  name: string;
  icon_key: string;
  image_url: string | null;
  image_alt_text: string;
}

export interface Achievement extends GamificationBadge {
  key: string;
  reward_xp: number;
  status: "locked" | "unlocked" | "revoked";
  requirement: number;
  metric: "tried" | "reviews" | "brands";
  progress: number;
  remaining: number;
  awarded_at: string | null;
}

export interface OwnGamification extends GamificationBadge {
  rules_version: string;
  level: number;
  total_xp: number;
  min_xp: number;
  next_threshold: number | null;
  xp_to_next: number;
  progress: number;
  total_tried: number;
  total_reviews: number;
  highlighted_achievements: (GamificationBadge & {
    key: string;
    reward_xp: number;
    awarded_at: string;
  })[];
  achievements: Achievement[];
}

export const gamificationPath = "auth/me/gamification/";

export function getOwnGamification(signal?: AbortSignal) {
  return get<OwnGamification>(gamificationPath, undefined, signal, true);
}

export function groupAchievements(achievements: readonly Achievement[]) {
  return {
    completed: achievements.filter((award) => award.status === "unlocked"),
    pending: achievements.filter((award) => award.status !== "unlocked"),
  };
}

export function progressRatio(value: number, maximum = 1) {
  if (!Number.isFinite(value) || !Number.isFinite(maximum) || maximum <= 0)
    return 0;
  return Math.min(1, Math.max(0, value / maximum));
}
