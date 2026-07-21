import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { WebView } from "react-native-webview";
import { colors } from "../../constants/theme";
import { fetchAnnuaire, type AnnuaireMerchant } from "../../lib/api";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMapHtml(merchants: (AnnuaireMerchant & { latitude: number; longitude: number })[]): string {
  const markers = merchants
    .map(
      (m) =>
        `L.marker([${m.latitude}, ${m.longitude}], { icon: pinIcon }).addTo(map).bindPopup(${JSON.stringify(
          `<b>${escapeHtml(m.businessName)}</b><br>${escapeHtml(m.category)}<br>${escapeHtml(m.address)}`,
        )});`,
    )
    .join("\n");
  const bounds = JSON.stringify(merchants.map((m) => [m.latitude, m.longitude]));

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;padding:0;}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { scrollWheelZoom: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var pinIcon = L.divIcon({
      html: '<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0Z" fill="${colors.brand700}" /><circle cx="14" cy="14" r="5.5" fill="${colors.brand50}" /></svg>',
      className: '',
      iconSize: [28, 40],
      iconAnchor: [14, 40],
      popupAnchor: [0, -36]
    });
    ${markers}
    map.fitBounds(${bounds}, { padding: [24, 24] });
  </script>
</body>
</html>`;
}

export default function Annuaire() {
  const [merchants, setMerchants] = useState<AnnuaireMerchant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const result = await fetchAnnuaire();
          if (!cancelled) setMerchants(result.merchants);
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : "Impossible de charger l'annuaire.");
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const located = useMemo(
    () =>
      (merchants ?? []).filter(
        (m): m is AnnuaireMerchant & { latitude: number; longitude: number } =>
          m.latitude !== null && m.longitude !== null,
      ),
    [merchants],
  );
  const unlocated = useMemo(() => (merchants ?? []).filter((m) => m.latitude === null || m.longitude === null), [merchants]);

  const mapHtml = useMemo(() => (located.length > 0 ? buildMapHtml(located) : null), [located]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!merchants) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  if (merchants.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Aucun commerçant agréé pour l&apos;instant.</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {mapHtml && (
        <View style={styles.mapContainer}>
          <WebView source={{ html: mapHtml }} style={styles.map} />
        </View>
      )}
      {unlocated.length > 0 && (
        <ScrollView
          style={[styles.unlocatedList, !mapHtml && styles.unlocatedListFull]}
          contentContainerStyle={styles.unlocatedListContent}
        >
          <Text style={styles.unlocatedTitle}>Commerçants non localisés sur la carte :</Text>
          {unlocated.map((m) => (
            <View key={m.businessName} style={styles.unlocatedRow}>
              <Text style={styles.unlocatedName}>{m.businessName}</Text>
              <Text style={styles.unlocatedCategory}>{m.category}</Text>
              <Text style={styles.unlocatedAddress}>{m.address}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 24 },
  error: { color: "#b00020", textAlign: "center" },
  empty: { color: colors.brand300, textAlign: "center" },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  unlocatedList: { borderTopWidth: 1, borderTopColor: colors.brand100, maxHeight: 220 },
  unlocatedListFull: { maxHeight: undefined, flex: 1 },
  unlocatedListContent: { padding: 16 },
  unlocatedTitle: { fontSize: 13, color: colors.brand300, marginBottom: 8 },
  unlocatedRow: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  unlocatedName: { fontSize: 15, fontWeight: "600", color: colors.foreground },
  unlocatedCategory: { fontSize: 13, color: colors.brand800, marginTop: 2 },
  unlocatedAddress: { fontSize: 12, color: colors.brand300, marginTop: 2 },
});
