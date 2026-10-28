import { Link } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

type LucideName = ComponentProps<typeof Lucide>["name"];

type Transaction = {
  id: string;
  merchant: string;
  amount: string;
  category: string;
  time: string;
  direction: "in" | "out";
  icon: LucideName;
};

// Demo values until the transactions API is connected.
const TRANSACTIONS: Transaction[] = [
  {
    id: "fresh-market",
    merchant: "Fresh Market",
    amount: "−₦ 18,400",
    category: "Groceries",
    time: "Today, 10:42 AM",
    direction: "out",
    icon: "shopping-basket",
  },
  {
    id: "salary-payment",
    merchant: "Salary payment",
    amount: "+₦ 850,000",
    category: "Income",
    time: "Yesterday",
    direction: "in",
    icon: "arrow-down-left",
  },
];

function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <View className="flex-row items-center gap-3 py-[17px]">
      <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-north-surface-raised">
        <Lucide name={transaction.icon} size={20} color="#a6b0a8" />
      </View>

      <View className="flex-1 gap-[7px]">
        <View className="flex-row items-center justify-between gap-3">
          <Text
            numberOfLines={1}
            className="flex-1 font-inter-semibold text-[14px] leading-[16.9px] text-north-text"
          >
            {transaction.merchant}
          </Text>
          <Text
            className={`font-inter-semibold text-[14px] leading-[16.9px] ${
              transaction.direction === "in"
                ? "text-north-accent"
                : "text-north-text"
            }`}
          >
            {transaction.amount}
          </Text>
        </View>

        <Text className="font-inter-regular text-[12px] leading-[14.5px] text-north-muted">
          {transaction.category} · {transaction.time}
        </Text>
      </View>
    </View>
  );
}

export function RecentActivity() {
  return (
    <View className="gap-[5px]">
      <View className="h-9 flex-row items-center justify-between">
        <Text className="font-inter-regular text-[18px] leading-[21.8px] text-north-text">
          Recent activity
        </Text>
        <Link href="/(tabs)/activity" asChild>
          <Pressable
            hitSlop={8}
            accessibilityRole="link"
            className="active:opacity-70"
          >
            <Text className="font-inter-regular text-[12px] leading-[14.5px] text-north-accent">
              View all
            </Text>
          </Pressable>
        </Link>
      </View>

      <View>
        {TRANSACTIONS.map((transaction, index) => (
          <View key={transaction.id}>
            {index > 0 ? (
              <View className="h-px bg-north-border" />
            ) : null}
            <TransactionRow transaction={transaction} />
          </View>
        ))}
      </View>
    </View>
  );
}
