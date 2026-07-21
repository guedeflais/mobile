import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Butterfly } from "../../components/Butterfly";
import { colors } from "../../constants/theme";
import { useAuth } from "../../lib/auth";
import type { TransactionItem, TransactionStatus, TransactionType } from "../../lib/api";

function formatGatinelles(cents: number): string {
  return `${(cents / 100).toFixed(2)} G`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

const TYPE_LABELS: Record<TransactionType, string> = {
  PURCHASE: "Achat",
  PAYMENT: "Paiement",
  CONVERSION: "Reconversion",
  EXPIRY: "Péremption",
};

const TYPE_ICONS: Record<TransactionType, keyof typeof Ionicons.glyphMap> = {
  PURCHASE: "bag-outline",
  PAYMENT: "storefront-outline",
  CONVERSION: "swap-horizontal-outline",
  EXPIRY: "time-outline",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "En attente",
  COMPLETED: "Complété",
  REJECTED: "Rejeté",
};

const STATUS_COLORS: Record<TransactionStatus, string> = {
  PENDING: "#b45309",
  COMPLETED: colors.leaf700,
  REJECTED: "#b00020",
};

function TransactionRow({ item }: { item: TransactionItem }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={TYPE_ICONS[item.type]} size={18} color={colors.brand700} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{TYPE_LABELS[item.type] ?? item.type}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          {item.counterpartyLabel ?? formatDate(item.createdAt)}
        </Text>
      </View>
      <View style={styles.rowAmountBlock}>
        <Text style={[styles.rowAmount, { color: item.isOutgoing ? "#b00020" : colors.leaf700 }]}>
          {item.isOutgoing ? "-" : "+"}
          {formatGatinelles(item.amountCents)}
        </Text>
        <Text style={[styles.rowStatus, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
      </View>
    </View>
  );
}

export default function Wallet() {
  const router = useRouter();
  const {
    user,
    balanceCents,
    transactions,
    transactionsPage,
    transactionsHasMore,
    refreshBalance,
    refreshTransactions,
  } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshBalance();
      refreshTransactions();
    }, [refreshBalance, refreshTransactions]),
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionRow item={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Butterfly flying={false} />
          <Text style={styles.title}>Bonjour {user?.fullName}</Text>
          <Text style={styles.balanceLabel}>Solde disponible</Text>
          <Text style={styles.balance}>{formatGatinelles(balanceCents ?? 0)}</Text>
          <Pressable style={styles.buyButton} onPress={() => router.push("/acheter")}>
            <Text style={styles.buyButtonText}>Acheter des gâtinelles</Text>
          </Pressable>
          <Text style={styles.historyTitle}>Historique</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>Aucune transaction pour l&apos;instant.</Text>}
      ListFooterComponent={
        transactionsPage > 1 || transactionsHasMore ? (
          <View style={styles.pagination}>
            <Pressable
              style={[styles.pageButton, transactionsPage <= 1 && styles.pageButtonDisabled]}
              onPress={() => refreshTransactions(transactionsPage - 1)}
              disabled={transactionsPage <= 1}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={transactionsPage <= 1 ? colors.brand300 : colors.brand700}
              />
              <Text style={[styles.pageButtonText, transactionsPage <= 1 && styles.pageButtonTextDisabled]}>
                Précédent
              </Text>
            </Pressable>
            <Text style={styles.pageLabel}>Page {transactionsPage}</Text>
            <Pressable
              style={[styles.pageButton, !transactionsHasMore && styles.pageButtonDisabled]}
              onPress={() => refreshTransactions(transactionsPage + 1)}
              disabled={!transactionsHasMore}
            >
              <Text style={[styles.pageButtonText, !transactionsHasMore && styles.pageButtonTextDisabled]}>
                Suivant
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={!transactionsHasMore ? colors.brand300 : colors.brand700}
              />
            </Pressable>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 24, flexGrow: 1 },
  header: { alignItems: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "600", color: colors.brand700, marginTop: 12, marginBottom: 24, textAlign: "center" },
  balanceLabel: { fontSize: 14, color: colors.foreground },
  balance: { fontSize: 40, fontWeight: "700", color: colors.leaf700, marginBottom: 16 },
  buyButton: {
    backgroundColor: colors.brand700,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  buyButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  historyTitle: { alignSelf: "flex-start", fontSize: 16, fontWeight: "600", color: colors.brand800, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand50,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  rowSubtitle: { fontSize: 12, color: colors.brand300, marginTop: 2 },
  rowAmountBlock: { alignItems: "flex-end" },
  rowAmount: { fontSize: 15, fontWeight: "600" },
  rowStatus: { fontSize: 11, marginTop: 2 },
  empty: { textAlign: "center", color: colors.brand300, marginTop: 24 },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  pageButton: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 4 },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: colors.brand700, fontSize: 14, fontWeight: "600" },
  pageButtonTextDisabled: { color: colors.brand300 },
  pageLabel: { fontSize: 13, color: colors.brand300 },
});
