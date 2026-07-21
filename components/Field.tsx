import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function Field({ children, error }: { children: ReactNode; error?: string }) {
  return (
    <View style={styles.field}>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  fieldError: { color: "#b00020", fontSize: 12, marginTop: 4 },
});
