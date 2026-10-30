import { Text, View } from "react-native";

import { Lucide } from "@/icons";

import type { Transaction } from "./transactions";

type TransactionCardProps = {
  transaction: Transaction;
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isIncome = transaction.direction === "in";

  return (
    <View
      accessible
      accessibilityLabel={`${transaction.merchant}, ${transaction.category}, ${transaction.time}, ${
        isIncome ? "received" : "spent"
      } ${transaction.amount.replace(/^[−+]/, "")}`}
      className="h-14 flex-row items-center gap-3 rounded-2xl border border-north-border bg-north-surface pl-[13px] pr-[15px]"
    >
      <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-north-surface-raised">
        {transaction.icon ? (
          <Lucide name={transaction.icon} size={12} color="#d4f77d" />
        ) : (
          <Text className="font-inter-semibold text-[13px] leading-[16px] text-north-accent">
            {transaction.initial ?? transaction.merchant.charAt(0)}
          </Text>
        )}
      </View>

      <View className="min-w-0 flex-1 gap-[3px] pt-0.5">
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-[14px] leading-[17px] text-north-text"
        >
          {transaction.merchant}
        </Text>
        <Text
          numberOfLines={1}
          className="font-inter-regular text-[11px] leading-[13.3px] text-north-muted"
        >
          {transaction.category} · {transaction.time}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        className={`shrink-0 font-inter-semibold text-[14px] leading-[17px] ${
          isIncome ? "text-north-accent" : "text-north-text"
        }`}
      >
        {transaction.amount}
      </Text>
    </View>
  );
}
