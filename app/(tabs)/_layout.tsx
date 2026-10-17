import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette } from "@/components/wedding/primitives";
import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.slate,
        tabBarInactiveTintColor: palette.muted,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginBottom: 2 },
        tabBarStyle: { height: 62 + bottomPadding, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: palette.paper, borderTopColor: palette.line, borderTopWidth: 1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Planning", tabBarIcon: ({ color, size }) => <MaterialIcons name="event-note" color={color} size={size} /> }} />
      <Tabs.Screen name="library" options={{ title: "Bibliothèque", tabBarIcon: ({ color, size }) => <MaterialIcons name="view-quilt" color={color} size={size} /> }} />
      <Tabs.Screen name="tasks" options={{ title: "Tâches", tabBarIcon: ({ color, size }) => <MaterialIcons name="check-circle-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="budget" options={{ title: "Budget", tabBarIcon: ({ color, size }) => <MaterialIcons name="donut-large" color={color} size={size} /> }} />
    </Tabs>
  );
}
