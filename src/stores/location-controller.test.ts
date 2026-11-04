import { afterEach, expect, it, vi } from "vitest";
import {
  createLocationController,
  type LocationAdapter,
} from "./location-controller";
const position = { latitude: -34.6, longitude: -58.4 };
function setup(overrides: Partial<LocationAdapter> = {}) {
  const adapter = {
    permission: vi
      .fn()
      .mockResolvedValue({ granted: false, canAskAgain: true }),
    requestPermission: vi
      .fn()
      .mockResolvedValue({ granted: true, canAskAgain: true }),
    servicesEnabled: vi.fn().mockResolvedValue(true),
    currentPosition: vi.fn().mockResolvedValue(position),
    ...overrides,
  };
  const clear = vi.fn();
  return {
    adapter,
    clear,
    controller: createLocationController(adapter, clear),
  };
}
afterEach(() => vi.useRealTimers());
it("does not ask for permission or locate until explicitly requested", async () => {
  const { controller, adapter } = setup();
  await controller.locate();
  expect(controller.getSnapshot()).toEqual({ position: null, state: "idle" });
  expect(adapter.requestPermission).not.toHaveBeenCalled();
  expect(adapter.currentPosition).not.toHaveBeenCalled();
  await controller.locate(true);
  expect(controller.getSnapshot()).toEqual({ position, state: "ready" });
});
it("restores a previously granted native permission without prompting", async () => {
  const { controller, adapter } = setup({
    permission: async () => ({ granted: true, canAskAgain: true }),
  });
  await controller.locate();
  expect(controller.getSnapshot().position).toEqual(position);
  expect(adapter.requestPermission).not.toHaveBeenCalled();
});
it("keeps results hidden after denial and exposes settings after permanent denial", async () => {
  const { controller, adapter } = setup({
    requestPermission: async () => ({ granted: false, canAskAgain: false }),
  });
  await controller.locate(true);
  expect(controller.getSnapshot()).toEqual({
    position: null,
    state: "blocked",
  });
  expect(adapter.currentPosition).not.toHaveBeenCalled();
});
it("handles disabled location services and recovery", async () => {
  const enabled = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
  const { controller } = setup({ servicesEnabled: enabled });
  await controller.locate(true);
  expect(controller.getSnapshot().state).toBe("disabled");
  await controller.locate(true);
  expect(controller.getSnapshot().state).toBe("ready");
});
it("removes coordinates and queries immediately in background and rechecks permission on resume", async () => {
  const permission = vi
    .fn()
    .mockResolvedValueOnce({ granted: true })
    .mockResolvedValue({ granted: false, canAskAgain: false });
  const { controller, clear } = setup({ permission });
  await controller.locate();
  controller.suspend();
  expect(controller.getSnapshot().position).toBeNull();
  expect(clear).toHaveBeenCalled();
  await controller.locate();
  expect(controller.getSnapshot()).toEqual({
    position: null,
    state: "blocked",
  });
});
it("ignores a delayed position after a background transition", async () => {
  let resolve!: (value: typeof position) => void;
  const currentPosition = vi.fn(
    () =>
      new Promise<typeof position>((done) => {
        resolve = done;
      }),
  );
  const { controller } = setup({ currentPosition });
  const pending = controller.locate(true);
  await vi.waitFor(() => expect(currentPosition).toHaveBeenCalled());
  controller.suspend();
  resolve(position);
  await pending;
  expect(controller.getSnapshot().position).toBeNull();
});
it("times out a hanging fix and allows a retry", async () => {
  vi.useFakeTimers();
  const currentPosition = vi
    .fn()
    .mockImplementationOnce(() => new Promise(() => {}))
    .mockResolvedValue(position);
  const { controller } = setup({ currentPosition });
  const pending = controller.locate(true);
  await vi.advanceTimersByTimeAsync(15001);
  await pending;
  expect(controller.getSnapshot().state).toBe("error");
  await controller.locate(true);
  expect(controller.getSnapshot().state).toBe("ready");
});
