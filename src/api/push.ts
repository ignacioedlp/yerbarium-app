import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { write, apiBaseUrl } from "./client";

const key = `push.installation.${apiBaseUrl.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
type Binding = { id: string; binding_id: string; userId: number };
let binding: Binding | undefined;
let serial: Promise<unknown> = Promise.resolve();
function sequence<T>(action: () => Promise<T>): Promise<T> {
  const next = serial.catch(() => undefined).then(action);
  serial = next;
  return next;
}
export async function pushPermission() {
  return Notifications.getPermissionsAsync();
}
export function registerPush(userId: number, ask = false) {
  return sequence(async () => {
    if (Platform.OS === "android")
      await Notifications.setNotificationChannelAsync("social", {
        name: "Sociales",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    let permission = await pushPermission();
    if (ask && !permission.granted && permission.canAskAgain)
      permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      await removeBinding();
      return permission;
    }
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) throw new Error("Push project missing");
    const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
      .data;
    const saved = await SecureStore.getItemAsync(key);
    const previous: Binding | undefined = saved ? JSON.parse(saved) : undefined;
    binding =
      previous?.userId === userId
        ? previous
        : {
            id: previous?.id ?? Crypto.randomUUID(),
            binding_id: Crypto.randomUUID(),
            userId,
          };
    await SecureStore.setItemAsync(key, JSON.stringify(binding));
    await write(`auth/push-installations/${binding.id}/`, "PUT", {
      binding_id: binding.binding_id,
      token,
      platform: Platform.OS,
      environment:
        process.env.EXPO_PUBLIC_PUSH_ENVIRONMENT ??
        (__DEV__ ? "development" : "production"),
    });
    return permission;
  });
}
async function removeBinding() {
  const saved = await SecureStore.getItemAsync(key);
  const current: Binding | undefined =
    binding ?? (saved ? JSON.parse(saved) : undefined);
  if (current)
    await write(`auth/push-installations/${current.id}/`, "DELETE", {
      binding_id: current.binding_id,
    });
  binding = undefined;
  await SecureStore.deleteItemAsync(key);
}
export function unregisterPush() {
  return sequence(removeBinding);
}
