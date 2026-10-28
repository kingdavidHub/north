import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Lucide } from "@/icons";

const ACTIVE_TINT = "#d4f77d";
const INACTIVE_TINT = "#a6b0a8";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: INACTIVE_TINT,
        tabBarStyle: {
          backgroundColor: "#111413",
          borderTopColor: "#323a34",
          borderTopWidth: 1,
          height: 72 + insets.bottom,
          paddingTop: 12,
          paddingBottom: insets.bottom + 6,
        },
        tabBarItemStyle: { padding: 0, justifyContent: "center" },
        tabBarLabelStyle: {
          fontFamily: "Inter_400Regular",
          fontSize: 11,
          lineHeight: 13.3,
          marginTop: 3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Lucide name="house" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => (
            <Lucide name="activity" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cards",
          tabBarIcon: ({ color }) => (
            <Lucide name="credit-card" size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Lucide name="user-round" size={21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
