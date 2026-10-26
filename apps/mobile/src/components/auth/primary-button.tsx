import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
} from "react-native";

import { Lucide } from "@/icons";

type LucideName = ComponentProps<typeof Lucide>["name"];

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon?: LucideName;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  icon = "arrow-right",
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading, disabled: loading }}
      className={`h-14 flex-row items-center justify-between rounded-xl bg-north-accent px-5 active:opacity-85 ${
        loading ? "opacity-70" : ""
      }`}
    >
      <Text className="font-inter-semibold text-[15px] leading-[18px] text-north-bg">
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator color="#111413" />
      ) : (
        <Lucide name={icon} size={20} color="#111413" />
      )}
    </Pressable>
  );
}
