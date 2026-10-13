import { PostHog } from "posthog-react-native";

const token = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export const posthogClient =
  token && token !== "your_posthog_project_token"
    ? new PostHog(token, {
        host,
        captureAppLifecycleEvents: true,
      })
    : null;

export function trackAnalyticsEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
): void {
  try {
    posthogClient?.capture(event, properties);
  } catch {
    // Analytics must not interrupt app actions.
  }
}
