import { expect, it } from "vitest";
import { profileSchema } from "./profile-update";
const profile = {
  username: "matero",
  display_name: "Matero",
  bio: "",
  country_code: "ar",
  is_private: false,
};
it("includes the edited username in the profile payload and normalizes whitespace", () => {
  expect(
    profileSchema.parse({ ...profile, username: " nuevo.usuario " }),
  ).toMatchObject({ username: "nuevo.usuario", country_code: "AR" });
});
it("rejects empty and oversized usernames before requesting a save", () => {
  for (const username of ["", " ", "x".repeat(151)])
    expect(profileSchema.safeParse({ ...profile, username }).success).toBe(
      false,
    );
});
it("retains Unicode usernames supported by the backend", () => {
  expect(profileSchema.parse({ ...profile, username: "materó" }).username).toBe(
    "materó",
  );
});

it("sends the edited username with PATCH and returns the saved account name", async () => {
  const { privateApi, write } = await import("./client");
  const previous = privateApi.defaults.adapter;
  privateApi.defaults.adapter = async (config) => {
    expect(config.method).toBe("patch");
    expect(config.url).toBe("auth/me/");
    expect(JSON.parse(config.data)).toMatchObject({
      username: "nuevo.usuario",
    });
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { username: "nuevo.usuario" },
    };
  };
  try {
    expect(
      await write(
        "auth/me/",
        "PATCH",
        profileSchema.parse({ ...profile, username: "nuevo.usuario" }),
      ),
    ).toEqual({ username: "nuevo.usuario" });
  } finally {
    privateApi.defaults.adapter = previous;
  }
});

it("preserves availability errors as username field errors for the form", async () => {
  const { AxiosError } = await import("axios");
  const { privateApi, write, normalizeError } = await import("./client");
  const previous = privateApi.defaults.adapter;
  privateApi.defaults.adapter = async (config) => {
    throw new AxiosError("Bad Request", "400", config, undefined, {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config,
      data: { username: ["Este username ya está en uso."] },
    });
  };
  try {
    await expect(
      write("auth/me/", "PATCH", profile).catch((error) => {
        throw normalizeError(error);
      }),
    ).rejects.toMatchObject({
      status: 400,
      fields: { username: ["Este usuario ya está en uso."] },
    });
  } finally {
    privateApi.defaults.adapter = previous;
  }
});
