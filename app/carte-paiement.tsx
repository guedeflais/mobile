import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { colors } from "../constants/theme";
import type { Up2PayForm } from "../lib/api";

type Outcome = "succes" | "attente" | "refuse" | "annule";

const OUTCOME_MESSAGES: Record<Outcome, string> = {
  succes:
    "Paiement reçu, en cours de validation par Up2Pay. Votre solde sera mis à jour automatiquement dans quelques instants.",
  attente:
    "Votre paiement est en attente de validation par votre banque. Votre solde sera mis à jour dès que la décision sera connue.",
  refuse: "Le paiement par carte a été refusé. Vous pouvez réessayer ou choisir un autre moyen de paiement.",
  annule: "Paiement annulé.",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAutoSubmitHtml(form: Up2PayForm): string {
  const inputs = form.fields
    .map((f) => `<input type="hidden" name="${escapeHtml(f.name)}" value="${escapeHtml(f.value)}" />`)
    .join("");
  return `<!DOCTYPE html><html><body onload="document.forms[0].submit()">
    <form method="POST" action="${escapeHtml(form.actionUrl)}">${inputs}</form>
  </body></html>`;
}

function extractAchatParam(url: string): Outcome | null {
  const match = url.match(/[?&]achat=([^&#]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  if (value === "succes" || value === "attente" || value === "refuse" || value === "annule") {
    return value;
  }
  return null;
}

export default function CartePaiement() {
  const router = useRouter();
  const { form: formParam } = useLocalSearchParams<{ form: string }>();
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const form = useMemo<Up2PayForm | null>(() => {
    if (!formParam) return null;
    try {
      return JSON.parse(formParam) as Up2PayForm;
    } catch {
      return null;
    }
  }, [formParam]);

  const html = useMemo(() => (form ? buildAutoSubmitHtml(form) : null), [form]);

  function handleShouldStart(request: WebViewNavigation | { url: string }): boolean {
    const found = extractAchatParam(request.url);
    if (found) {
      setOutcome(found);
      return false;
    }
    return true;
  }

  if (outcome) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultMessage}>{OUTCOME_MESSAGES[outcome]}</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/")}>
          <Text style={styles.buttonText}>Retour au portefeuille</Text>
        </Pressable>
      </View>
    );
  }

  if (!html) {
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultMessage}>Impossible de préparer le paiement.</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <WebView
        source={{ html }}
        onShouldStartLoadWithRequest={handleShouldStart}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.brand700} size="large" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  resultContainer: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center" },
  resultMessage: { fontSize: 16, color: colors.foreground, textAlign: "center", marginBottom: 24 },
  button: { backgroundColor: colors.brand700, borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
