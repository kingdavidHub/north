import { Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

export type LoginMethod = "email" | "phone";

type LoginMethodToggleProps = {
  value: LoginMethod;
  onChange: (method: LoginMethod) => void;
};

const OPTIONS = [
  { value: "email", label: "Email", icon: "mail" },
  { value: "phone", label: "Phone number", icon: "smartphone" },
] as const;

export function LoginMethodToggle({
  value,
  onChange,
}: LoginMethodToggleProps) {
  return (
    <View className="h-[54px] flex-row gap-1 rounded-xl bg-north-surface p-1.5">
      {OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[9px] ${
              active ? "bg-north-surface-raised" : "bg-north-surface"
            }`}
          >
            <Lucide
              name={option.icon}
              size={16}
              color={active ? "#d4f77d" : "#a6b0a8"}
            />
            <Text
              className={
                active
                  ? "font-inter-semibold text-[13px] leading-[16px] text-north-text"
                  : "font-inter-regular text-[13px] leading-[16px] text-north-muted"
              }
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
