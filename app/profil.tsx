import { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect } from "expo-router";
import { colors } from "../constants/theme";
import { useAuth } from "../lib/auth";
import { ProfileUpdateError } from "../lib/api";
import { CategoryPicker } from "../components/CategoryPicker";
import { Field } from "../components/Field";

export default function Profil() {
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await refreshProfile();
        setLoading(false);
      })();
    }, [refreshProfile]),
  );

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName);
    setEmail(profile.email);
    if (profile.merchant) {
      setBusinessName(profile.merchant.businessName);
      setAddress(profile.merchant.address);
      setCategory(profile.merchant.category);
      setIban(profile.merchant.iban);
    }
  }, [profile]);

  const isMerchant = user?.accountType === "COMMERCANT";

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await updateProfile({
        fullName,
        email,
        merchant: isMerchant ? { businessName, address, category, iban } : undefined,
      });
      setSuccess("Profil mis à jour.");
    } catch (err) {
      if (err instanceof ProfileUpdateError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : "Impossible de mettre à jour le profil.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Field error={fieldErrors.fullName}>
          <TextInput
            style={styles.input}
            placeholder="Nom complet"
            placeholderTextColor={colors.brand300}
            value={fullName}
            onChangeText={setFullName}
          />
        </Field>

        <Field error={fieldErrors.email}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.brand300}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </Field>

        {isMerchant && (
          <>
            <Field error={fieldErrors["merchant.businessName"]}>
              <TextInput
                style={styles.input}
                placeholder="Nom du commerce"
                placeholderTextColor={colors.brand300}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </Field>

            <Field error={fieldErrors["merchant.address"]}>
              <TextInput
                style={styles.input}
                placeholder="Adresse"
                placeholderTextColor={colors.brand300}
                value={address}
                onChangeText={setAddress}
              />
            </Field>

            <Field error={fieldErrors["merchant.category"]}>
              <CategoryPicker value={category} onChange={setCategory} />
            </Field>

            <Field error={fieldErrors["merchant.iban"]}>
              <TextInput
                style={styles.input}
                placeholder="IBAN (pour les reconversions en euros)"
                placeholderTextColor={colors.brand300}
                autoCapitalize="characters"
                value={iban}
                onChangeText={setIban}
              />
            </Field>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  container: { flexGrow: 1, padding: 24, paddingBottom: 160 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.brand300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  error: { color: "#b00020", marginBottom: 12, textAlign: "center" },
  success: { color: colors.leaf700, marginBottom: 12, textAlign: "center" },
  button: { backgroundColor: colors.brand700, borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
