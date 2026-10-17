import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { useSession } from "./session";
import { registerPush } from "@/api/push";
import { pushTarget } from "@/api/push-target";

export function NotificationObserver() {
  const { user, ready } = useSession();
  const seen = useRef(new Set<string>());
  useEffect(() => {
    if (!ready || !user?.id) return;
    let active = true;
    const sync = () => {
      void registerPush(user.id!).catch(() => undefined);
    };
    sync();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    const tokenChange = Notifications.addPushTokenListener(sync);
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => ({
        shouldShowBanner:
          notification.request.content.data?.recipient_id === user.id,
        shouldShowList:
          notification.request.content.data?.recipient_id === user.id,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    const handle = (response: Notifications.NotificationResponse | null) => {
      if (!active || !response) return;
      const data = response.notification.request.content.data ?? {};
      const target = pushTarget(data, user.id!);
      if (!target) {
        void Notifications.clearLastNotificationResponseAsync().catch(
          () => undefined,
        );
        return;
      }
      if (seen.current.has(String(data.event_id))) return;
      seen.current.add(String(data.event_id));
      router.push(target);
      void Notifications.clearLastNotificationResponseAsync().catch(
        () => undefined,
      );
    };
    void Notifications.getLastNotificationResponseAsync()
      .then(handle)
      .catch(() => undefined);
    const subscription =
      Notifications.addNotificationResponseReceivedListener(handle);
    return () => {
      active = false;
      subscription.remove();
      appState.remove();
      tokenChange.remove();
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: false,
          shouldShowList: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    };
  }, [ready, user?.id]);
  return null;
}
