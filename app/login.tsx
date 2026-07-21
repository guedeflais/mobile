import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/theme";
import { useAuth } from "../lib/auth";
import { Butterfly } from "../components/Butterfly";

type Mode = "pin" | "password";

export default function Login() {
  const router = useRouter();
  const { loginWithPin, loginWithPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("pin");
  const [memberNumber, setMemberNumber] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "pin") {
        await loginWithPin(memberNumber.trim(), pin.trim());
      } else {
        await loginWithPassword(email.trim(), password);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.butterflyWrapper}>
        <Butterfly flying={false} />
      </View>
      <Text style={styles.title}>Connexion</Text>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, mode === "pin" && styles.tabActive]} onPress={() => setMode("pin")}>
          <Text style={[styles.tabText, mode === "pin" && styles.tabTextActive]}>N° adhérent + PIN</Text>
        </Pressable>
        <Pressable style={[styles.tab, mode === "password" && styles.tabActive]} onPress={() => setMode("password")}>
          <Text style={[styles.tabText, mode === "password" && styles.tabTextActive]}>Email + mot de passe</Text>
        </Pressable>
      </View>

      {mode === "pin" ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Numéro d'adhérent"
            placeholderTextColor={colors.brand300}
            autoCapitalize="none"
            value={memberNumber}
            onChangeText={setMemberNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Code PIN"
            placeholderTextColor={colors.brand300}
            secureTextEntry
            keyboardType="number-pad"
            value={pin}
            onChangeText={setPin}
          />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.brand300}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor={colors.brand300}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
      </Pressable>

      <Pressable style={styles.linkButton} onPress={() => router.push("/register")}>
        <Text style={styles.linkButtonText}>Créer un compte</Text>
      </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  butterflyWrapper: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "600", color: colors.brand700, marginBottom: 24, textAlign: "center" },
  tabs: {
    flexDirection: "row",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.brand300,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: colors.brand50 },
  tabActive: { backgroundColor: colors.brand700 },
  tabText: { color: colors.brand700, fontSize: 13 },
  tabTextActive: { color: "#fff", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.brand300,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  error: { color: "#b00020", marginBottom: 12, textAlign: "center" },
  button: { backgroundColor: colors.brand700, borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkButton: { marginTop: 16, alignItems: "center" },
  linkButtonText: { color: colors.brand800, fontSize: 14 },
});
