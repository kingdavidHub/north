import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

// Demo values until the accounts API is connected.
const TOTAL_BALANCE = "₦ 2,845,320";
const HIDDEN_BALANCE = "₦ •••••••";

export function BalancePanel() {
  const [hidden, setHidden] = useState(false);

  return (
    <View className="gap-2 pb-3 pt-[18px]">
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-regular text-[13px] leading-[15.7px] text-north-muted">
          Total balance
        </Text>
        <Pressable
          onPress={() => setHidden((value) => !value)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
          className="active:opacity-70"
        >
          <Lucide
            name={hidden ? "eye-off" : "eye"}
            size={17}
            color="#a6b0a8"
          />
        </Pressable>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="font-inter-medium text-[43px] leading-[48.2px] text-north-text"
      >
        {hidden ? HIDDEN_BALANCE : TOTAL_BALANCE}
      </Text>

      <Text className="font-inter-regular text-[13px] leading-[15.7px] text-north-muted">
        Available to spend
      </Text>
    </View>
  );
}
