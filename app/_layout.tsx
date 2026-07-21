import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../lib/auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#4f8fc0" }, headerTintColor: "#fff" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Connexion" }} />
        <Stack.Screen name="register" options={{ title: "Créer un compte" }} />
        <Stack.Screen name="nfc-tags" options={{ title: "Mes bracelets/cartes NFC" }} />
        <Stack.Screen name="profil" options={{ title: "Modifier mon profil" }} />
        <Stack.Screen name="reconversion" options={{ title: "Reconversion en euros" }} />
      </Stack>
    </AuthProvider>
  );
}
