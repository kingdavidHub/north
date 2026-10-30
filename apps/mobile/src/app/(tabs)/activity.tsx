import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityEmptyState } from "@/components/activity/activity-empty-state";
import {
  ActivityFilters,
  type ActivityFilter,
} from "@/components/activity/activity-filters";
import { ActivityHeader } from "@/components/activity/activity-header";
import { ActivitySearch } from "@/components/activity/activity-search";
import { TransactionCard } from "@/components/activity/transaction-card";
import {
  ACTIVITY_GROUPS,
  type ActivityGroup,
  type Transaction,
} from "@/components/activity/transactions";

function matchesFilter(transaction: Transaction, filter: ActivityFilter) {
  if (filter === "all") {
    return true;
  }

  if (filter === "pending") {
    return transaction.pending === true;
  }

  return transaction.direction === (filter === "income" ? "in" : "out");
}

function matchesQuery(transaction: Transaction, query: string) {
  if (!query) {
    return true;
  }

  return `${transaction.merchant} ${transaction.category} ${transaction.time} ${transaction.amount}`
    .toLowerCase()
    .includes(query);
}

function MonthHeader({
  group,
  showTotal,
}: {
  group: ActivityGroup;
  showTotal: boolean;
}) {
  return (
    <View className="mt-0.5 flex-row items-center justify-between gap-4 pr-px">
      <Text className="font-inter-semibold text-[10px] leading-[13.3px] text-north-muted">
        {group.label}
      </Text>
      {showTotal ? (
        <Text className="font-inter-semibold text-[11px] leading-[13.3px] text-north-text">
          Total {group.total}
        </Text>
      ) : null}
    </View>
  );
}

export default function ActivityScreen() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const isSearching = query.trim().length > 0;
  const isFiltering = isSearching || filter !== "all";

  const groups = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();

    return ACTIVITY_GROUPS.map((group) => ({
      ...group,
      transactions: group.transactions.filter(
        (transaction) =>
          matchesFilter(transaction, filter) &&
          matchesQuery(transaction, normalisedQuery),
      ),
    })).filter((group) => group.transactions.length > 0);
  }, [filter, query]);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: "#111413" }}
    >
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 24,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ActivityHeader />

        <View className="mt-4">
          <ActivitySearch value={query} onChangeText={setQuery} />
        </View>

        <View className="mt-4">
          <ActivityFilters value={filter} onChange={setFilter} />
        </View>

        {groups.length > 0 ? (
          <View className="mt-[15px]">
            {groups.map((group, index) => (
              <View key={group.id} className={index > 0 ? "mt-3" : undefined}>
                <MonthHeader group={group} showTotal={!isFiltering} />
                <View className="mt-2 gap-[10px]">
                  {group.transactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <ActivityEmptyState filter={filter} isSearching={isSearching} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
