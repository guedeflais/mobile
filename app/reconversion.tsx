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
} from "react-native";
import { colors } from "../constants/theme";
import { useAuth } from "../lib/auth";

export default function Reconversion() {
  const { balanceCents, requestConversion } = useAuth();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    const amountEuros = Number(amount);
    if (!Number.isFinite(amountEuros) || amountEuros <= 0) {
      setError("Montant invalide.");
      return;
    }

    setSubmitting(true);
    try {
      await requestConversion(amountEuros);
      setSuccess("Demande de reconversion envoyée à l'association.");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la demande.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          Une fois la demande envoyée, l&apos;association effectue le virement bancaire puis
          valide la demande. Le montant demandé sort immédiatement de votre solde disponible.
        </Text>
        <Text style={styles.subtitle}>
          Commission fixe de 0.50 G, plus commission variable de 0.1% du montant reconverti.
          Optez de préférence pour une utilisation de vos gâtinelles chez un autre commerçant.
        </Text>

        {balanceCents !== null && (
          <Text style={styles.balance}>Solde disponible : {(balanceCents / 100).toFixed(2)} G</Text>
        )}

        <Text style={styles.sectionLabel}>Montant à reconvertir en euros</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.brand300}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Demander la reconversion</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 24 },
  subtitle: { fontSize: 14, color: colors.foreground, marginBottom: 12 },
  balance: { fontSize: 15, fontWeight: "600", color: colors.brand800, marginBottom: 16 },
  sectionLabel: { fontSize: 13, color: colors.foreground, marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.brand300,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: colors.foreground,
  },
  error: { color: "#b00020", marginBottom: 12, textAlign: "center" },
  success: { color: colors.leaf700, marginBottom: 12, textAlign: "center" },
  button: { backgroundColor: colors.brand700, borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
