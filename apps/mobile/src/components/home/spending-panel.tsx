import { Text, View } from "react-native";

import { Lucide } from "@/icons";

// Demo values until the budgets API is connected.
const SPENT = "₦ 428,650";
const BUDGET = "₦ 700,000";
const USED_PERCENT = 61;

export function SpendingPanel() {
  return (
    <View className="gap-[13px] rounded-[20px] bg-north-surface p-[18px]">
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-regular text-[14px] leading-[16.9px] text-north-text">
          Spending this month
        </Text>
        <Lucide name="arrow-up-right" size={17} color="#a6b0a8" />
      </View>

      <View className="flex-row items-baseline justify-between">
        <Text className="font-inter-medium text-[27px] leading-[32.7px] text-north-text">
          {SPENT}
        </Text>
        <Text className="font-inter-regular text-[12px] leading-[14.5px] text-north-accent">
          {USED_PERCENT}% used
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Monthly budget used"
        accessibilityValue={{ min: 0, max: 100, now: USED_PERCENT }}
        className="h-[5px] overflow-hidden rounded-full bg-north-border"
      >
        <View
          className="h-full rounded-full bg-north-accent"
          style={{ width: `${USED_PERCENT}%` }}
        />
      </View>

      <Text className="font-inter-regular text-[12px] leading-[14.5px] text-north-muted">
        of {BUDGET} monthly budget
      </Text>
    </View>
  );
}
