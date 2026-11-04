import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { Lucide } from "@/icons";

import type { ActivityFilter } from "./activity-filters";

type LucideName = ComponentProps<typeof Lucide>["name"];

type ActivityEmptyStateProps = {
  filter: ActivityFilter;
  isSearching: boolean;
};

function copyFor(filter: ActivityFilter, isSearching: boolean) {
  if (isSearching) {
    return {
      title: "No transactions found",
      description: "Try a different search or filter.",
      icon: "search-x" as LucideName,
    };
  }

  if (filter === "pending") {
    return {
      title: "Nothing pending",
      description: "Transactions waiting for approval will appear here.",
      icon: "clock" as LucideName,
    };
  }

  if (filter === "all") {
    return {
      title: "No transactions yet",
      description: "Your transactions will show up here.",
      icon: "wallet" as LucideName,
    };
  }

  return {
    title: filter === "income" ? "No income yet" : "No expenses yet",
    description:
      filter === "income"
        ? "Money you receive will show up here."
        : "Money you spend will show up here.",
    icon: "wallet" as LucideName,
  };
}

export function ActivityEmptyState({
  filter,
  isSearching,
}: ActivityEmptyStateProps) {
  const copy = copyFor(filter, isSearching);

  return (
    <View className="items-center px-8 pb-12 pt-16">
      <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-north-surface">
        <Lucide name={copy.icon} size={20} color="#a6b0a8" />
      </View>
      <Text className="text-center font-inter-semibold text-[16px] leading-[19px] text-north-text">
        {copy.title}
      </Text>
      <Text className="mt-2 text-center font-inter-regular text-[13px] leading-[16px] text-north-muted">
        {copy.description}
      </Text>
    </View>
  );
}
