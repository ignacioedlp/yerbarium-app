import { describe, expect, it } from "vitest";
import { pushTarget } from "./push-target";
describe("notification destinations", () => {
  const base = { event_id: "event", recipient_id: 2 };
  it("opens only typed social destinations for the current recipient", () => {
    expect(
      pushTarget({ ...base, kind: "follower", username: "matero" }, 2),
    ).toEqual({
      pathname: "/usuarios/[username]",
      params: { username: "matero" },
    });
    expect(
      pushTarget({ ...base, kind: "review_like", review_id: 15 }, 2),
    ).toEqual({ pathname: "/resenas/[id]", params: { id: "15" } });
  });
  it("rejects another recipient, malformed targets and arbitrary URLs", () => {
    expect(
      pushTarget({ ...base, kind: "review_like", review_id: 1 }, 3),
    ).toBeNull();
    for (const review_id of [-1, "2", 1.5, NaN])
      expect(
        pushTarget({ ...base, kind: "review_like", review_id }, 2),
      ).toBeNull();
    expect(
      pushTarget({ ...base, kind: "follower", username: "../../admin" }, 2),
    ).toBeNull();
    expect(pushTarget({ ...base, url: "https://evil.example" }, 2)).toBeNull();
  });
});
