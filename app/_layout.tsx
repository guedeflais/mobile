import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerStyle: { backgroundColor: "#4f8fc0" }, headerTintColor: "#fff" }}
      >
        <Stack.Screen name="index" options={{ title: "La Gâtinelle" }} />
      </Stack>
    </>
  );
}
