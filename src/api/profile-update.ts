import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Elegí un usuario.")
    .max(150, "El usuario no puede superar los 150 caracteres."),
  display_name: z.string().trim().min(1, "Ingresá tu nombre."),
  bio: z.string(),
  country_code: z
    .string()
    .trim()
    .regex(/^([a-zA-Z]{2})?$/, "Usá un código de país de dos letras.")
    .transform((value) => value.toUpperCase()),
  is_private: z.boolean(),
});
