import type { Href } from "expo-router";
export function pushTarget(
  data: Record<string, unknown>,
  userId: number,
): Href | null {
  if (data.recipient_id !== userId || typeof data.event_id !== "string")
    return null;
  if (
    data.kind === "follower" &&
    typeof data.username === "string" &&
    /^[\p{L}\p{N}_.@+-]{1,150}$/u.test(data.username)
  )
    return {
      pathname: "/usuarios/[username]",
      params: { username: data.username },
    };
  if (
    data.kind === "review_like" &&
    Number.isSafeInteger(data.review_id) &&
    Number(data.review_id) > 0
  )
    return {
      pathname: "/resenas/[id]",
      params: { id: String(data.review_id) },
    };
  return null;
}
