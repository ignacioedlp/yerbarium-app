export type NotificationPreferences = {
  social: boolean;
  brands: boolean;
  discovery: boolean;
  newsletter: boolean;
};
export const notificationLabels: Record<keyof NotificationPreferences, string> =
  {
    social: "Sociales",
    brands: "Marcas",
    discovery: "Descubrimiento",
    newsletter: "Quiero recibir novedades y newsletters por email",
  };
