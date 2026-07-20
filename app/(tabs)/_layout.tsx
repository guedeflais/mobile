import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";
import { useAuth } from "../../lib/auth";

export default function TabsLayout() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.brand700} />
      </View>
    );
  }

  const isCommercant = user.accountType === "COMMERCANT";

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.brand700 },
        headerTintColor: "#fff",
        tabBarActiveTintColor: colors.brand700,
        tabBarInactiveTintColor: colors.brand300,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Portefeuille",
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="payer"
        options={{
          title: "Payer un commerçant",
          tabBarLabel: "Payer",
          tabBarIcon: ({ color, size }) => <Ionicons name="send-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="recevoir"
        options={{
          title: "Recevoir un paiement",
          tabBarLabel: "Recevoir",
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" color={color} size={size} />,
          href: isCommercant ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="compte"
        options={{
          title: "Mon compte",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
