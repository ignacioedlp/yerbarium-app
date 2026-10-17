import { write } from "@/api/client";
export interface FollowMember {
  username: string;
  display_name: string;
}
export type FollowDirection = "followers" | "following";
export interface FollowState {
  followers_count?: number;
  following_count?: number;
  is_following: boolean;
}
export function followPath(username: string) {
  return `profiles/${encodeURIComponent(username)}/follow/`;
}
export function setFollowing(username: string, following: boolean) {
  return write<FollowState>(followPath(username), following ? "PUT" : "DELETE");
}
