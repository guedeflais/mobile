import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#4f8fc0" }, headerTintColor: "#fff" }}>
        <Stack.Screen name="index" options={{ title: "La Gâtinelle" }} />
        <Stack.Screen name="login" options={{ title: "Connexion" }} />
        <Stack.Screen name="payer" options={{ title: "Payer un commerçant" }} />
      </Stack>
    </AuthProvider>
  );
}
