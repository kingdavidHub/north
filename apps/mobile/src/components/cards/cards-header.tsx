import { Alert, Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

function handleAddCard() {
  Alert.alert(
    "Add a card",
    "Ordering a new card will be available once the North API is connected.",
  );
}

export function CardsHeader() {
  return (
    <View className="h-[50px] flex-row items-center justify-between gap-4">
      <View>
        <Text className="font-inter-bold text-[11px] leading-[13.3px] text-north-muted">
          PAY YOUR WAY
        </Text>
        <Text className="mt-1 font-inter-bold text-[28px] leading-[34px] text-north-text">
          Your cards
        </Text>
      </View>

      <Pressable
        onPress={handleAddCard}
        accessibilityRole="button"
        accessibilityLabel="Add a card"
        accessibilityHint="Start ordering a new North card"
        className="h-10 w-10 items-center justify-center rounded-full border border-north-border bg-north-surface active:opacity-70"
      >
        <Lucide name="plus" size={18} color="#fafcf6" />
      </Pressable>
    </View>
  );
}
