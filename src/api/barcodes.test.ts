import { afterEach, expect, it, vi } from "vitest";
import { ApiError, get } from "./client";
import { lookupBarcode, scannedBarcode } from "./barcodes";
vi.mock("./client", () => ({
  get: vi.fn(),
  normalizeError: (error: unknown) => error,
  ApiError: class extends Error {
    constructor(
      message: string,
      public status: number,
    ) {
      super(message);
    }
  },
}));
afterEach(() => vi.resetAllMocks());
const local = {
  status: "FOUND_LOCAL",
  barcode: "7791234567890",
  yerba: { slug: "yerba-real" },
};
it.each([
  ["ean13", "7791234567890"],
  ["upc_a", "012345678901"],
  ["upc_e", "01234565"],
])("accepts %s without losing leading zeroes", (type, code) => {
  expect(scannedBarcode(type, ` ${code} `)).toBe(code);
});
it.each([
  ["qr", "7791234567890"],
  ["ean13", "１２３４５６７８９０１２３"],
  ["upc_a", "12345678"],
  ["upc_e", "1234567x"],
  ["ean8", "12345678"],
])("ignores unsupported or malformed %s", (type, code) => {
  expect(scannedBarcode(type, code)).toBeNull();
});
it("calls the public barcode endpoint with cancellation and returns the catalog slug", async () => {
  vi.mocked(get).mockResolvedValueOnce(local);
  const signal = new AbortController().signal;
  await expect(lookupBarcode("7791234567890", signal)).resolves.toEqual(local);
  expect(get).toHaveBeenCalledExactlyOnceWith(
    "barcodes/7791234567890/",
    undefined,
    signal,
  );
});
it.each([
  ["0123456789012", "123456789012"],
  ["123456789012", "0123456789012"],
])(
  "resolves UPC-A/EAN-13 aliases while prioritizing catalog matches",
  async (code, alias) => {
    vi.mocked(get)
      .mockResolvedValueOnce({
        status: "FOUND_EXTERNAL",
        product: { name: "External" },
      })
      .mockResolvedValueOnce(local);
    await expect(lookupBarcode(code)).resolves.toEqual(local);
    expect(get).toHaveBeenLastCalledWith(
      `barcodes/${alias}/`,
      undefined,
      undefined,
    );
  },
);
it.each(["NOT_FOUND", "FOUND_EXTERNAL"])(
  "preserves %s without inventing a catalog match",
  async (status) => {
    const result = { status, barcode: "7791234567890" };
    vi.mocked(get).mockResolvedValueOnce(result);
    await expect(lookupBarcode("7791234567890")).resolves.toEqual(result);
    expect(get).toHaveBeenCalledTimes(1);
  },
);
it.each([0, 429, 503])(
  "propagates errors (%s) for retry UI",
  async (status) => {
    const error = new ApiError("unavailable", status);
    vi.mocked(get).mockRejectedValueOnce(error);
    await expect(lookupBarcode("7791234567890")).rejects.toBe(error);
    expect(get).toHaveBeenCalledTimes(1);
  },
);
it("does not send invalid input to the backend", async () => {
  await expect(lookupBarcode("123/path")).rejects.toThrow();
  expect(get).not.toHaveBeenCalled();
});

it("finds a local UPC alias when external discovery is unavailable for the EAN spelling", async () => {
  vi.mocked(get)
    .mockRejectedValueOnce(new ApiError("unavailable", 503))
    .mockResolvedValueOnce(local);
  await expect(lookupBarcode("0123456789012")).resolves.toEqual(local);
});
it("does not turn an unavailable alias lookup into an unknown-code result", async () => {
  const error = new ApiError("unavailable", 503);
  vi.mocked(get)
    .mockResolvedValueOnce({ status: "NOT_FOUND" })
    .mockRejectedValueOnce(error);
  await expect(lookupBarcode("0123456789012")).rejects.toBe(error);
});
it("never attempts an alias after cancellation", async () => {
  const controller = new AbortController();
  controller.abort();
  const error = new ApiError("unavailable", 503);
  vi.mocked(get).mockRejectedValueOnce(error);
  await expect(lookupBarcode("0123456789012", controller.signal)).rejects.toBe(
    error,
  );
  expect(get).toHaveBeenCalledTimes(1);
});
