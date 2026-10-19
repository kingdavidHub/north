import { Text, View } from "react-native";

import { Screen } from "@/components/screen";

export default function ActivityScreen() {
  return (
    <Screen>
      <View className="flex-1 gap-2 px-6 pt-6">
        <Text className="text-3xl font-bold text-zinc-900">Activity</Text>
        <Text className="text-base text-zinc-500">
          Your recent transactions will appear here.
        </Text>
      </View>
    </Screen>
  );
}
