import { Text, View } from "react-native";

const WEEKDAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

function formatDate(date: Date) {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

function greetingFor(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function firstName(name: string) {
  const [first] = name.trim().split(/[\s.@_-]+/).filter(Boolean);

  if (!first) {
    return null;
  }

  return first.charAt(0).toUpperCase() + first.slice(1);
}

function initialsFor(name: string) {
  const parts = name.trim().split(/[\s.@_-]+/).filter(Boolean);
  const [first] = parts;

  if (!first) {
    return "N";
  }

  if (parts.length === 1) {
    return first.slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

type HomeHeaderProps = {
  name: string;
};

export function HomeHeader({ name }: HomeHeaderProps) {
  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const customer = firstName(name);

  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1 gap-[7px]">
        <Text className="font-inter-medium text-[11px] leading-[13.3px] text-north-muted">
          {formatDate(now)}
        </Text>
        <Text
          numberOfLines={1}
          className="font-inter-regular text-[23px] leading-[27.8px] text-north-text"
        >
          {customer ? `${greeting}, ${customer}` : greeting}
        </Text>
      </View>

      <View
        accessible
        accessibilityLabel={name ? `Signed in as ${name}` : "Profile"}
        className="h-12 w-12 items-center justify-center rounded-full bg-north-surface-raised"
      >
        <Text className="font-inter-semibold text-[14px] leading-[16.9px] text-north-accent">
          {initialsFor(name)}
        </Text>
      </View>
    </View>
  );
}
