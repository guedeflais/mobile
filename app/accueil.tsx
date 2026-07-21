import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Butterfly } from "../components/Butterfly";
import { colors } from "../constants/theme";

export default function Accueil() {
  const router = useRouter();

  return (
    <LinearGradient colors={[colors.brand700, colors.leaf700]} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.center}>
          <Butterfly flying={false} size={88} />
          <Text style={styles.title}>Bienvenue sur{"\n"}La Gâtinelle</Text>
          <Text style={styles.subtitle}>
            La monnaie locale numérique{"\n"}de la Gâtine Poitevine
          </Text>
          <Text style={styles.poem}>
            Comme le papillon butine de fleur en fleur{"\n"}
            et féconde la prairie sur son passage,{"\n"}
            la Gâtinelle circule de main en main à travers la Gâtine Poitevine{"\n"}
            et fait grandir tous ceux qui la font vivre.
          </Text>
        </View>

        <Pressable style={styles.linkButton} onPress={() => router.push("/annuaire")}>
          <Text style={styles.linkButtonText}>Annuaire des commerçants</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 56, justifyContent: "space-between" },
  backButton: { alignSelf: "flex-start", marginBottom: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  title: { fontSize: 28, fontWeight: "600", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.brand100, textAlign: "center" },
  poem: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 8,
  },
  linkButton: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  linkButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
