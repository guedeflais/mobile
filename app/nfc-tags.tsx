import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";
import { useAuth } from "../lib/auth";
import type { NfcTagItem } from "../lib/api";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

export default function NfcTags() {
  const { nfcTags, refreshNfcTags, addNfcTag, removeNfcTag } = useAuth();
  const [tagUid, setTagUid] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshNfcTags();
    }, [refreshNfcTags]),
  );

  async function handleAdd() {
    setError(null);
    if (!tagUid.trim()) {
      setError("Numéro de série requis.");
      return;
    }
    setAdding(true);
    try {
      await addNfcTag(tagUid.trim().toUpperCase());
      setTagUid("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ajouter ce bracelet/carte.");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeNfcTag(id);
    } finally {
      setRemovingId(null);
    }
  }

  function renderItem({ item }: { item: NfcTagItem }) {
    return (
      <View style={styles.row}>
        <Ionicons name="radio-outline" size={20} color={colors.brand700} />
        <View style={styles.rowBody}>
          <Text style={styles.rowUid}>{item.tagUid}</Text>
          <Text style={styles.rowDate}>Ajouté le {formatDate(item.createdAt)}</Text>
        </View>
        <Pressable onPress={() => handleRemove(item.id)} disabled={removingId === item.id}>
          {removingId === item.id ? (
            <ActivityIndicator color="#b00020" size="small" />
          ) : (
            <Ionicons name="trash-outline" size={20} color="#b00020" />
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={nfcTags}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Utilisés pour payer sans code, en mode festival. Un même compte peut avoir plusieurs
            bracelets/cartes.
          </Text>
          <Text style={styles.note}>
            La lecture NFC directe depuis l&apos;appli nécessitera une version compilée (elle
            n&apos;est pas disponible dans Expo Go) — en attendant, saisis le numéro de série
            indiqué par l&apos;organisateur.
          </Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              placeholder="Numéro de série du tag"
              placeholderTextColor={colors.brand300}
              autoCapitalize="characters"
              value={tagUid}
              onChangeText={setTagUid}
            />
            <Pressable style={styles.addButton} onPress={handleAdd} disabled={adding}>
              {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Ajouter</Text>}
            </Pressable>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Aucun bracelet/carte lié pour l&apos;instant.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 24, flexGrow: 1 },
  header: { marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.foreground, marginBottom: 8 },
  note: { fontSize: 12, color: colors.brand300, marginBottom: 16 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.brand300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  addButton: {
    backgroundColor: colors.brand700,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#b00020", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowUid: { fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "monospace" },
  rowDate: { fontSize: 12, color: colors.brand300, marginTop: 2 },
  empty: { textAlign: "center", color: colors.brand300, marginTop: 24 },
});
