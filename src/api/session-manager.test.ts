import { describe, expect, it, vi } from "vitest";
import { SessionManager, TokenPair } from "./session-manager";
import { ApiError } from "./client";
function setup(renew: (token: string) => Promise<TokenPair>) {
  const store = {
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  const changed = vi.fn();
  return { store, changed, manager: new SessionManager(store, renew, changed) };
}
describe("mobile sessions", () => {
  it("shares one concurrent refresh and persists the rotated token", async () => {
    const renew = vi
      .fn()
      .mockResolvedValue({ access: "new-access", refresh: "new-refresh" });
    const { manager, store } = setup(renew);
    manager.hydrate("old-refresh");
    const first = manager.refresh(),
      second = manager.refresh();
    expect(first).toBe(second);
    await Promise.all([first, second]);
    expect(renew).toHaveBeenCalledTimes(1);
    expect(store.set).toHaveBeenCalledWith("new-refresh");
    expect(manager.access).toBe("new-access");
  });
  it("clears a rejected session and private data notification", async () => {
    const { manager, store, changed } = setup(async () => {
      throw new ApiError("Expired", 401);
    });
    manager.hydrate("expired");
    await expect(manager.refresh()).rejects.toMatchObject({ status: 401 });
    expect(manager.refreshToken).toBeNull();
    expect(store.remove).toHaveBeenCalled();
    expect(changed).toHaveBeenCalledWith(false);
  });
  it("preserves credentials after a transient network failure and allows retry", async () => {
    const renew = vi
      .fn()
      .mockRejectedValueOnce(new ApiError("Offline"))
      .mockResolvedValueOnce({ access: "retry-access", refresh: "rotated" });
    const { manager, store } = setup(renew);
    manager.hydrate("valid");
    await expect(manager.refresh()).rejects.toThrow("Offline");
    expect(manager.refreshToken).toBe("valid");
    expect(store.remove).not.toHaveBeenCalled();
    await expect(manager.refresh()).resolves.toBe("retry-access");
  });
  it("does not resurrect a session when logout races a refresh", async () => {
    let resolve!: (value: TokenPair) => void;
    const { manager, store } = setup(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    manager.hydrate("old");
    const pending = manager.refresh();
    await Promise.resolve();
    await manager.clear();
    resolve({ access: "stale", refresh: "stale" });
    await expect(pending).rejects.toMatchObject({ status: 401 });
    expect(manager.access).toBeNull();
    expect(store.set).not.toHaveBeenCalled();
  });
  it("serializes SecureStore writes when logout happens during token persistence", async () => {
    let finish!: () => void;
    const { manager, store } = setup(async () => ({
      access: "access",
      refresh: "rotated",
    }));
    store.set.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    manager.hydrate("old");
    const pending = manager.refresh();
    await vi.waitFor(() => expect(store.set).toHaveBeenCalled());
    const logout = manager.clear();
    finish();
    await logout;
    await expect(pending).rejects.toMatchObject({ status: 401 });
    expect(store.set.mock.invocationCallOrder[0]).toBeLessThan(
      store.remove.mock.invocationCallOrder[0],
    );
    expect(manager.access).toBeNull();
  });
});
