import { Text, View } from "react-native";

import { Screen } from "@/components/screen";

export default function CardsScreen() {
  return (
    <Screen>
      <View className="flex-1 gap-2 px-6 pt-6">
        <Text className="text-3xl font-bold text-zinc-900">Cards</Text>
        <Text className="text-base text-zinc-500">
          Manage your payment cards.
        </Text>
      </View>
    </Screen>
  );
}
