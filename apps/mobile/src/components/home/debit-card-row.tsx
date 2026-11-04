import { Link } from "expo-router";
import { Pressable, Text } from "react-native";

import { Lucide } from "@/icons";

export function DebitCardRow() {
  return (
    <Link href="/(tabs)/cards" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="NORTH Debit card ending 4821"
        className="h-12 flex-row items-center gap-[10px] rounded-xl border border-north-border bg-north-surface px-3.5 active:opacity-80"
      >
        <Lucide name="credit-card" size={20} color="#a6b0a8" />
        <Text className="flex-1 font-inter-semibold text-[12px] leading-[14.5px] text-north-text">
          NORTH Debit
        </Text>
        <Text className="font-inter-regular text-[12px] leading-[14.5px] text-north-muted">
          •••• 4821
        </Text>
        <Lucide name="chevron-right" size={14} color="#a6b0a8" />
      </Pressable>
    </Link>
  );
}
