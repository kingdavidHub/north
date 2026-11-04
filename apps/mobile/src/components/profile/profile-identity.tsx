import { Text, View } from "react-native";

import { Lucide } from "@/icons";

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

type ProfileIdentityProps = {
  name: string;
  email?: string;
};

export function ProfileIdentity({ name, email }: ProfileIdentityProps) {
  return (
    <View className="items-center pt-1">
      <View
        accessible
        accessibilityLabel={name ? `${name}'s avatar` : "Profile avatar"}
        className="h-16 w-16 items-center justify-center rounded-full border border-north-border bg-north-surface-raised"
      >
        <Text className="font-inter-bold text-[18px] leading-[22px] text-north-accent">
          {initialsFor(name)}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        className="mt-4 max-w-full font-inter-bold text-[20px] leading-[24px] text-north-text"
      >
        {name}
      </Text>

      {email ? (
        <Text
          numberOfLines={1}
          className="mt-1 max-w-full font-inter-regular text-[12px] leading-[14.5px] text-north-muted"
        >
          {email}
        </Text>
      ) : null}

      <View className="mt-3 h-[26px] flex-row items-center gap-1.5 rounded-full bg-north-accent-soft px-3">
        <Lucide name="check" size={12} color="#d4f77d" />
        <Text className="font-inter-semibold text-[10px] leading-[12px] text-north-accent">
          Verified account
        </Text>
      </View>
    </View>
  );
}
