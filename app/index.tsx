import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/theme";
import { useAuth } from "../lib/auth";

function formatGatinelles(cents: number): string {
  return `${(cents / 100).toFixed(2)} G`;
}

export default function Home() {
  const router = useRouter();
  const { isLoading, user, balanceCents, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bonjour {user.fullName}</Text>
      <Text style={styles.balanceLabel}>Solde disponible</Text>
      <Text style={styles.balance}>{formatGatinelles(balanceCents ?? 0)}</Text>
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 22, fontWeight: "600", color: colors.brand700, marginBottom: 24, textAlign: "center" },
  balanceLabel: { fontSize: 14, color: colors.foreground },
  balance: { fontSize: 40, fontWeight: "700", color: colors.leaf700, marginBottom: 32 },
  button: { backgroundColor: colors.brand800, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
