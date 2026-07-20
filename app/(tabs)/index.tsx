import { StyleSheet, Text, View } from "react-native";
import { Butterfly } from "../../components/Butterfly";
import { colors } from "../../constants/theme";
import { useAuth } from "../../lib/auth";

function formatGatinelles(cents: number): string {
  return `${(cents / 100).toFixed(2)} G`;
}

export default function Wallet() {
  const { user, balanceCents } = useAuth();

  return (
    <View style={styles.container}>
      <Butterfly flying={false} />
      <Text style={styles.title}>Bonjour {user?.fullName}</Text>
      <Text style={styles.balanceLabel}>Solde disponible</Text>
      <Text style={styles.balance}>{formatGatinelles(balanceCents ?? 0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 22, fontWeight: "600", color: colors.brand700, marginBottom: 24, textAlign: "center" },
  balanceLabel: { fontSize: 14, color: colors.foreground },
  balance: { fontSize: 40, fontWeight: "700", color: colors.leaf700 },
});
