import { router, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

type LucideName = ComponentProps<typeof Lucide>["name"];

type QuickAction = {
  label: string;
  icon: LucideName;
  accent?: boolean;
  href?: Href;
};

const ACTIONS: QuickAction[] = [
  { label: "Send", icon: "arrow-up-right", accent: true },
  { label: "Add money", icon: "plus" },
  { label: "Cards", icon: "credit-card", href: "/(tabs)/cards" },
  { label: "More", icon: "ellipsis", href: "/(tabs)/profile" },
];

function runAction(action: QuickAction) {
  if (action.href) {
    router.push(action.href);
    return;
  }

  Alert.alert(
    action.label,
    `${action.label} will be available once the North API is connected.`,
  );
}

export function QuickActions() {
  return (
    <View className="flex-row gap-[10px] py-[3px]">
      {ACTIONS.map((action) => (
        <Pressable
          key={action.label}
          onPress={() => runAction(action)}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          className="flex-1 items-center gap-[10px] active:opacity-80"
        >
          <View
            className={`h-[52px] w-[52px] items-center justify-center rounded-full ${
              action.accent ? "bg-north-accent" : "bg-north-surface-raised"
            }`}
          >
            <Lucide
              name={action.icon}
              size={21}
              color={action.accent ? "#111413" : "#fafcf6"}
            />
          </View>
          <Text className="font-inter-regular text-[12px] leading-[14.5px] text-north-text">
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
