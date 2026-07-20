import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/theme";
import { useAuth } from "../../lib/auth";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  PARTICULIER: "Particulier",
  COMMERCANT: "Commerçant",
};

export default function Compte() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Nom</Text>
        <Text style={styles.value}>{user?.fullName}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>

        <Text style={styles.label}>Type de compte</Text>
        <Text style={styles.value}>
          {user?.accountType ? (ACCOUNT_TYPE_LABELS[user.accountType] ?? user.accountType) : "—"}
        </Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  label: { fontSize: 12, color: colors.brand300, marginTop: 12 },
  value: { fontSize: 16, color: colors.foreground, marginTop: 2 },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.brand800,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutButtonText: { color: colors.brand800, fontSize: 15, fontWeight: "600" },
});
