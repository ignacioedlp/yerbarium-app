import { get, write } from "@/api/client";
import { BlockStatus, ReportReason } from "@/api/community-types";

export async function getBlockStatus(username: string) {
  return get<BlockStatus>(
    `profiles/${encodeURIComponent(username)}/block/`,
    undefined,
    undefined,
    true,
  );
}

export async function blockUser(username: string) {
  return write<BlockStatus>(
    `profiles/${encodeURIComponent(username)}/block/`,
    "POST",
  );
}

export async function unblockUser(username: string) {
  return write<BlockStatus>(
    `profiles/${encodeURIComponent(username)}/block/`,
    "DELETE",
  );
}

export async function reportReview(
  reviewId: number,
  reason: ReportReason,
  details = "",
) {
  return write<{ detail: string }>(`reviews/${reviewId}/report/`, "POST", {
    reason,
    details,
  });
}

export async function reportUser(
  username: string,
  reason: ReportReason,
  details = "",
) {
  return write<{ detail: string }>(
    `profiles/${encodeURIComponent(username)}/report/`,
    "POST",
    { reason, details },
  );
}
