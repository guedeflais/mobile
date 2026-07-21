import { useState, type ReactNode } from "react";
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
import { API_BASE_URL } from "../lib/config";
import { colors } from "../constants/theme";
import { CategoryPicker } from "../components/CategoryPicker";

type AccountType = "PARTICULIER" | "COMMERCANT";
type FieldErrors = Record<string, string>;

interface RegisterSuccessPayload {
  id: string;
  memberNumber: string;
}

interface RegisterErrorPayload {
  error?: string;
  fieldErrors?: FieldErrors;
}

class RegisterError extends Error {
  fieldErrors: FieldErrors;
  constructor(message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

async function parseOrThrow(response: Response): Promise<RegisterSuccessPayload> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorData: RegisterErrorPayload | null = data;
    throw new RegisterError(
      typeof errorData?.error === "string" ? errorData.error : "Impossible de créer le compte.",
      errorData?.fieldErrors ?? {},
    );
  }
  return data as RegisterSuccessPayload;
}

function Field({ children, error }: { children: ReactNode; error?: string }) {
  return (
    <View style={styles.field}>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export default function Register() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("PARTICULIER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [iban, setIban] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [memberNumber, setMemberNumber] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setFieldErrors({});

    if (!/^\d{4}$/.test(pin)) {
      setError("Le code PIN doit comporter exactement 4 chiffres.");
      return;
    }
    if (pin !== pinConfirm) {
      setError("Les deux codes PIN ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          pin,
          accountType,
          merchant: accountType === "COMMERCANT" ? { businessName, address, category, iban } : undefined,
        }),
      });
      const data = await parseOrThrow(response);
      setMemberNumber(data.memberNumber);
    } catch (err) {
      if (err instanceof RegisterError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : "Impossible de créer le compte.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (memberNumber) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneText}>
          Compte créé ! Votre numéro d&apos;adhérent est{" "}
          <Text style={styles.doneMemberNumber}>{memberNumber}</Text>.
        </Text>
        <Text style={styles.doneSubtext}>
          Notez-le : avec votre code PIN, il vous servira à vous connecter rapidement.
        </Text>
        {accountType === "COMMERCANT" && (
          <Text style={styles.doneSubtext}>
            Votre compte commerçant doit être validé par l&apos;association avant de pouvoir
            recevoir des paiements.
          </Text>
        )}
        <Pressable style={styles.button} onPress={() => router.replace("/login")}>
          <Text style={styles.buttonText}>Aller à la connexion</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, accountType === "PARTICULIER" && styles.tabActive]}
            onPress={() => setAccountType("PARTICULIER")}
          >
            <Text style={[styles.tabText, accountType === "PARTICULIER" && styles.tabTextActive]}>
              Particulier
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, accountType === "COMMERCANT" && styles.tabActive]}
            onPress={() => setAccountType("COMMERCANT")}
          >
            <Text style={[styles.tabText, accountType === "COMMERCANT" && styles.tabTextActive]}>
              Commerçant
            </Text>
          </Pressable>
        </View>

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

        <Field error={fieldErrors.password}>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (8 caractères minimum)"
            placeholderTextColor={colors.brand300}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </Field>

        <View style={styles.row}>
          <View style={styles.rowInput}>
            <Field error={fieldErrors.pin}>
              <TextInput
                style={styles.input}
                placeholder="Code PIN (4 chiffres)"
                placeholderTextColor={colors.brand300}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                value={pin}
                onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
              />
            </Field>
          </View>
          <View style={styles.rowInput}>
            <Field>
              <TextInput
                style={styles.input}
                placeholder="Confirmer le PIN"
                placeholderTextColor={colors.brand300}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={4}
                value={pinConfirm}
                onChangeText={(v) => setPinConfirm(v.replace(/\D/g, "").slice(0, 4))}
              />
            </Field>
          </View>
        </View>

        {accountType === "COMMERCANT" && (
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

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => router.replace("/login")}>
          <Text style={styles.linkButtonText}>J&apos;ai déjà un compte</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 24, paddingBottom: 160 },
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
  tabText: { color: colors.brand700, fontSize: 14 },
  tabTextActive: { color: "#fff", fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  rowInput: { flex: 1 },
  field: { marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.brand300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  fieldError: { color: "#b00020", fontSize: 12, marginTop: 4 },
  error: { color: "#b00020", marginBottom: 12, textAlign: "center" },
  button: { backgroundColor: colors.brand700, borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkButton: { marginTop: 16, alignItems: "center" },
  linkButtonText: { color: colors.brand800, fontSize: 14 },
  doneContainer: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  doneText: { fontSize: 16, color: colors.foreground, marginBottom: 12, textAlign: "center" },
  doneMemberNumber: { fontFamily: "monospace", fontWeight: "700", fontSize: 18, color: colors.brand800 },
  doneSubtext: { fontSize: 14, color: colors.foreground, marginBottom: 16, textAlign: "center" },
});
