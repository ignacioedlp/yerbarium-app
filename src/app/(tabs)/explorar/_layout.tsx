import { Stack } from "expo-router";
import { theme } from "@/theme";
export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.colors.green,
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.colors.surface },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index"  />
    </Stack>
  );
}
