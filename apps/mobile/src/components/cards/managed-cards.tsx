import type { ComponentProps } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

import { type CardStatus, StatusPill } from "./status-pill";

type LucideName = ComponentProps<typeof Lucide>["name"];

type ManagedCard = {
  id: string;
  name: string;
  detail: string;
  status: CardStatus;
  icon: LucideName;
};

// Demo values until the cards API is connected.
const CARDS: ManagedCard[] = [
  {
    id: "virtual",
    name: "Virtual card",
    detail: "Online payments · •• 1904",
    status: "active",
    icon: "credit-card",
  },
  {
    id: "travel",
    name: "Travel card",
    detail: "International · •• 6620",
    status: "frozen",
    icon: "plane",
  },
];

function ManagedCardRow({ card }: { card: ManagedCard }) {
  const statusLabel = card.status === "active" ? "Active" : "Frozen";

  const handlePress = () => {
    Alert.alert(
      card.name,
      "Card settings will be available once the North API is connected.",
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${card.name}, ${card.detail}, ${statusLabel}`}
      accessibilityHint="Opens card settings"
      className="h-16 flex-row items-center gap-3 rounded-2xl border border-north-border bg-north-surface pl-3.5 pr-3 active:opacity-80"
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-north-surface-raised">
        <Lucide name={card.icon} size={16} color="#d4f77d" />
      </View>

      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="font-inter-bold text-[13px] leading-[16px] text-north-text"
        >
          {card.name}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 font-inter-regular text-[11px] leading-[13.3px] text-north-muted"
        >
          {card.detail}
        </Text>
      </View>

      <StatusPill status={card.status} />
      <Lucide name="chevron-right" size={15} color="#a6b0a8" />
    </Pressable>
  );
}

export function ManagedCards() {
  return (
    <View className="gap-2">
      {CARDS.map((card) => (
        <ManagedCardRow key={card.id} card={card} />
      ))}
    </View>
  );
}
