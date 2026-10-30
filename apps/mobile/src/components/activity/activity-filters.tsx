import { Pressable, Text, View } from "react-native";

export type ActivityFilter = "all" | "income" | "expenses" | "pending";

const FILTERS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expenses", label: "Expenses" },
  { id: "pending", label: "Pending" },
];

type ActivityFiltersProps = {
  value: ActivityFilter;
  onChange: (value: ActivityFilter) => void;
};

export function ActivityFilters({ value, onChange }: ActivityFiltersProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = filter.id === value;

        return (
          <Pressable
            key={filter.id}
            onPress={() => onChange(filter.id)}
            accessibilityRole="button"
            accessibilityLabel={`Show ${filter.label.toLowerCase()} transactions`}
            accessibilityState={{ selected: active }}
            className={`h-[33px] min-w-[43px] items-center justify-center rounded-full border px-2.5 active:opacity-80 ${
              active
                ? "border-north-accent bg-north-accent"
                : "border-north-border bg-north-surface"
            }`}
          >
            <Text
              className={`font-inter-medium text-[13px] leading-[15.7px] ${
                active ? "text-north-bg" : "text-north-muted"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
