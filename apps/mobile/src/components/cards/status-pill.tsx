import { Text, View } from "react-native";

export type CardStatus = "active" | "frozen";

const STATUS_COPY: Record<
  CardStatus,
  { label: string; container: string; dot: string; text: string }
> = {
  active: {
    label: "Active",
    container: "bg-north-accent-soft",
    dot: "bg-north-accent",
    text: "text-north-accent",
  },
  frozen: {
    label: "Frozen",
    container: "bg-north-surface-raised",
    dot: "bg-north-muted",
    text: "text-north-muted",
  },
};

type StatusPillProps = {
  status: CardStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  const copy = STATUS_COPY[status];

  return (
    <View
      accessible
      accessibilityLabel={`Card status: ${copy.label}`}
      className={`h-[22px] flex-row items-center gap-1.5 rounded-full px-2.5 ${copy.container}`}
    >
      <View className={`h-[5px] w-[5px] rounded-full ${copy.dot}`} />
      <Text
        className={`font-inter-bold text-[10px] leading-[12px] ${copy.text}`}
      >
        {copy.label}
      </Text>
    </View>
  );
}
