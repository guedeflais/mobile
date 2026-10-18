import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { colors } from "../constants/theme";

type Outcome = "succes" | "attente" | "refuse" | "annule";

const OUTCOME_MESSAGES: Record<Outcome, string> = {
  succes: "Paiement accepté. Vos gâtinelles ont été ajoutées à votre solde.",
  attente:
    "Votre paiement est en cours de validation. Votre solde sera mis à jour automatiquement dès que la banque aura confirmé.",
  refuse: "Le paiement par carte a été refusé. Vous pouvez réessayer ou choisir un autre moyen de paiement.",
  annule: "Paiement annulé.",
};

// Au retour de la page de paiement CAWL, le serveur (/api/cawl/retour)
// redirige vers /compte?achat=... ou /acheter?achat=... : on intercepte ces
// URL pour afficher notre propre écran de résultat au lieu de les charger.
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
  const { redirectUrl } = useLocalSearchParams<{ redirectUrl: string }>();
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  function handleShouldStart(request: WebViewNavigation | { url: string }): boolean {
    const found = extractAchatParam(request.url);
    if (found) {
      setOutcome(found);
      return false;
    }
    return true;
  }

  // Filet de sécurité : selon la plateforme, une redirection serveur n'appelle
  // pas toujours onShouldStartLoadWithRequest.
  function handleNavigationStateChange(navState: WebViewNavigation) {
    const found = extractAchatParam(navState.url);
    if (found) setOutcome(found);
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

  if (!redirectUrl || !redirectUrl.startsWith("https://")) {
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
        source={{ uri: redirectUrl }}
        onShouldStartLoadWithRequest={handleShouldStart}
        onNavigationStateChange={handleNavigationStateChange}
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
