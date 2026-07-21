import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import { colors } from "../../constants/theme";
import { useAuth } from "../../lib/auth";

export default function Recevoir() {
  const router = useRouter();
  const { user } = useAuth();
  const merchantCode = user?.merchantCode ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recevoir un paiement</Text>
      <Text style={styles.subtitle}>
        Faites scanner ce QR code par votre client, ou communiquez-lui le code ci-dessous.
      </Text>

      {merchantCode ? (
        <>
          <View style={styles.qrWrapper}>
            <QRCode value={merchantCode} size={200} color={colors.foreground} backgroundColor="#fff" />
          </View>
          <Text style={styles.code}>{merchantCode}</Text>
        </>
      ) : (
        <Text style={styles.error}>Code commerçant indisponible.</Text>
      )}

      <Pressable style={styles.conversionLink} onPress={() => router.push("/reconversion")}>
        <Text style={styles.conversionLinkText}>Reconvertir mes gâtinelles en euros</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 22, fontWeight: "600", color: colors.brand700, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.foreground, textAlign: "center", marginBottom: 24 },
  qrWrapper: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
  code: { fontSize: 24, fontWeight: "700", letterSpacing: 4, color: colors.brand800 },
  error: { color: "#b00020", textAlign: "center" },
  conversionLink: { marginTop: 32 },
  conversionLinkText: { color: colors.brand800, fontSize: 14, fontWeight: "500" },
});
