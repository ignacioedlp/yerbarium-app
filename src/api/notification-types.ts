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

export const notificationDescriptions: Record<
  keyof NotificationPreferences,
  string
> = {
  social:
    "Te avisamos cuando alguien te sigue o le da Me gusta a una de tus opiniones.",
  brands:
    "Guardamos tu interés en recibir novedades de marcas. Por ahora, esta opción no envía notificaciones.",
  discovery:
    "Guardamos tu interés en descubrir yerbas. Por ahora, esta opción no envía notificaciones.",
  newsletter:
    "Recibí novedades y newsletters por email. Es opcional e independiente de las notificaciones push y los emails de tu cuenta.",
};
