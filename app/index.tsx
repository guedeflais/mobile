import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/theme";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>La Gâtinelle</Text>
      <Text style={styles.subtitle}>La monnaie locale numérique de la Gâtine Poitevine</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.brand700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.foreground,
    textAlign: "center",
  },
});
