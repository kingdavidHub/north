import { Alert, Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

function showNotifications() {
  Alert.alert(
    "Notifications",
    "You're all caught up. We'll show new transaction alerts here.",
  );
}

export function ActivityHeader() {
  return (
    <View className="h-[50px] flex-row items-center justify-between gap-4">
      <View>
        <Text className="font-inter-semibold text-[10px] leading-[12px] text-north-muted">
          YOUR MONEY, IN MOTION
        </Text>
        <Text className="mt-1 font-inter-semibold text-[28px] leading-[34px] text-north-text">
          Activity
        </Text>
      </View>

      <Pressable
        onPress={showNotifications}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        accessibilityHint="Shows your latest alerts"
        className="h-10 w-10 items-center justify-center rounded-full border border-north-border bg-north-surface active:opacity-70"
      >
        <Lucide name="bell" size={18} color="#fafcf6" />
      </Pressable>
    </View>
  );
}
