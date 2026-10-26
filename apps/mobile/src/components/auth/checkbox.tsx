import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  error?: string;
};

export function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
  return (
    <View>
      <View className="flex-row items-start gap-3">
        <Pressable
          onPress={() => onChange(!checked)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={typeof label === "string" ? label : undefined}
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded-md border ${
            checked
              ? "border-north-accent bg-north-accent"
              : "border-north-border bg-north-surface"
          }`}
        >
          {checked ? (
            <Lucide name="check" size={13} color="#111413" />
          ) : null}
        </Pressable>

        <View className="flex-1">{label}</View>
      </View>

      {error ? (
        <Text className="mt-1.5 font-inter-regular text-xs text-north-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
