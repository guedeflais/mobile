import { useRef, useState } from "react";
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
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { Butterfly } from "../../components/Butterfly";
import { colors } from "../../constants/theme";
import { useAuth } from "../../lib/auth";

export default function Payer() {
  const { pay } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [merchantCode, setMerchantCode] = useState("");
  const [scannedViaQr, setScannedViaQr] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scanLock = useRef(false);

  async function handleOpenScanner() {
    setError(null);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setError("L'accès à la caméra est nécessaire pour scanner un QR code.");
        return;
      }
    }
    scanLock.current = false;
    setScanning(true);
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanLock.current) return;
    scanLock.current = true;
    setMerchantCode(result.data.trim().toUpperCase());
    setScannedViaQr(true);
    setScanning(false);
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(null);
    const amountEuros = Number(amount);
    if (!Number.isFinite(amountEuros) || amountEuros <= 0) {
      setError("Montant invalide.");
      return;
    }
    if (!merchantCode.trim()) {
      setError("Code commerçant requis.");
      return;
    }

    setSubmitting(true);
    try {
      await pay(merchantCode.trim().toUpperCase(), amountEuros);
      setSuccess(`Paiement de ${amountEuros} G effectué avec succès.`);
      setAmount("");
      setMerchantCode("");
      setScannedViaQr(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'effectuer le paiement.");
    } finally {
      setSubmitting(false);
    }
  }

  if (scanning) {
    return (
      <View style={styles.flex}>
        <CameraView
          style={styles.flex}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <Pressable style={styles.closeScanner} onPress={() => setScanning(false)}>
          <Text style={styles.closeScannerText}>Annuler</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Payer un commerçant</Text>
        <View style={styles.subtitleRow}>
          <Butterfly flying={success !== null} size={44} />
          <Text style={styles.subtitle}>Deux façons de payer :</Text>
        </View>

        {!scannedViaQr && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Option 1 — Scanner le QR code du commerçant</Text>
            <Pressable style={styles.scanButton} onPress={handleOpenScanner}>
              <Text style={styles.scanButtonText}>Scanner un QR code</Text>
            </Pressable>
          </View>
        )}

        {!scannedViaQr && (
          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {scannedViaQr ? "Code du commerçant (scanné)" : "Option 2 — Saisir son code"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex. 7QK4RT"
          placeholderTextColor={colors.brand300}
          autoCapitalize="characters"
          value={merchantCode}
          onChangeText={(value) => {
            setMerchantCode(value);
            if (value === "") setScannedViaQr(false);
          }}
        />

        <Text style={styles.sectionLabel}>Montant (en gâtinelles)</Text>
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
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Payer</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: "600", color: colors.brand700, marginBottom: 4 },
  subtitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  subtitle: { fontSize: 14, color: colors.foreground },
  section: { marginBottom: 12 },
  sectionLabel: { fontSize: 13, color: colors.foreground, marginBottom: 6 },
  scanButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.brand700,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  scanButtonText: { color: colors.brand700, fontWeight: "600" },
  separatorRow: { flexDirection: "row", alignItems: "center", marginVertical: 12, gap: 8 },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.brand300 },
  separatorText: { color: colors.brand300, fontSize: 13 },
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
  closeScanner: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: colors.brand800,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  closeScannerText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
