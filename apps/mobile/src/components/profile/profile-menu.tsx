import type { ComponentProps } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

type LucideName = ComponentProps<typeof Lucide>["name"];

type ProfileItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideName;
};

const ITEMS: ProfileItem[] = [
  {
    id: "personal-information",
    title: "Personal information",
    description: "Name, email and phone",
    icon: "user-round",
  },
  {
    id: "bank-accounts",
    title: "Bank accounts",
    description: "Linked accounts and details",
    icon: "landmark",
  },
  {
    id: "security",
    title: "Security & privacy",
    description: "Passcode, biometrics and PIN",
    icon: "shield-check",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Alerts and preferences",
    icon: "bell",
  },
  {
    id: "help",
    title: "Help & support",
    description: "We're here when you need us",
    icon: "life-buoy",
  },
];

function ProfileRow({ item }: { item: ProfileItem }) {
  const handlePress = () => {
    Alert.alert(
      item.title,
      `${item.title} will be available once the North API is connected.`,
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.description}`}
      accessibilityHint="Opens this profile section"
      className="h-16 flex-row items-center gap-3 rounded-2xl border border-north-border bg-north-surface px-3.5 active:opacity-80"
    >
      <View className="h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-north-surface-raised">
        <Lucide name={item.icon} size={15} color="#d4f77d" />
      </View>

      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="font-inter-bold text-[13px] leading-[16px] text-north-text"
        >
          {item.title}
        </Text>
        <Text
          numberOfLines={1}
          className="mt-0.5 font-inter-regular text-[10px] leading-[12px] text-north-muted"
        >
          {item.description}
        </Text>
      </View>

      <Lucide name="chevron-right" size={15} color="#a6b0a8" />
    </Pressable>
  );
}

export function ProfileMenu() {
  return (
    <View>
      <Text className="font-inter-semibold text-[10px] leading-[12px] text-north-muted">
        ACCOUNT
      </Text>

      <View className="mt-3 gap-2">
        {ITEMS.map((item) => (
          <ProfileRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}
