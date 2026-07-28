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
import type { PurchaseMethod } from "../lib/api";

type Method = PurchaseMethod | "CARD";

const METHODS: { value: Method; label: string }[] = [
  { value: "CASH", label: "Espèces (comptoir de change)" },
  { value: "TRANSFER", label: "Virement bancaire" },
  { value: "CARD", label: "Carte bancaire" },
];

export default function Acheter() {
  const router = useRouter();
  const { requestPurchase, requestCardPurchase } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("CASH");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setConfirmation(null);
    const amountEuros = Number(amount);
    if (!Number.isFinite(amountEuros) || amountEuros <= 0) {
      setError("Montant invalide.");
      return;
    }

    setSubmitting(true);
    try {
      if (method === "CARD") {
        const form = await requestCardPurchase(amountEuros);
        router.push({ pathname: "/carte-paiement", params: { form: JSON.stringify(form) } });
        return;
      }

      const result = await requestPurchase(amountEuros, method);
      if (method === "CASH") {
        setConfirmation(
          "Demande enregistrée. Présentez-vous à un comptoir de change avec les espèces pour valider votre achat.",
        );
      } else {
        const iban = result.associationIban ?? "IBAN de l'association non configuré";
        setConfirmation(
          `Demande enregistrée. Effectuez un virement de ${amountEuros} € vers ${iban} en indiquant votre nom. Vos gâtinelles seront créditées après vérification par l'association.`,
        );
      }
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'achat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>
          1 gâtinelle = 1 euro. Les gâtinelles achetées sont valables 1 an à compter de leur achat.
        </Text>

        <Text style={styles.sectionLabel}>Montant (en euros)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.brand300}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.sectionLabel}>Moyen de paiement</Text>
        {METHODS.map((m) => (
          <Pressable key={m.value} style={styles.radioRow} onPress={() => setMethod(m.value)}>
            <View style={[styles.radioOuter, method === m.value && styles.radioOuterActive]}>
              {method === m.value && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>{m.label}</Text>
          </Pressable>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {confirmation ? <Text style={styles.success}>{confirmation}</Text> : null}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Valider ma demande d&apos;achat</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 24 },
  subtitle: { fontSize: 14, color: colors.foreground, marginBottom: 20 },
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
  radioRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.brand300,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: { borderColor: colors.brand700 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand700 },
  radioLabel: { fontSize: 15, color: colors.foreground },
  error: { color: "#b00020", marginTop: 8, marginBottom: 12, textAlign: "center" },
  success: { color: colors.leaf700, marginTop: 8, marginBottom: 12, textAlign: "center" },
  button: { backgroundColor: colors.brand700, borderRadius: 8, padding: 14, alignItems: "center", marginTop: 12 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
