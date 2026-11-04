import {
  ActivityIndicator,
  Pressable,
  Text,
} from "react-native";

import { Lucide } from "@/icons";

type SignOutButtonProps = {
  onPress: () => void;
  loading: boolean;
};

export function SignOutButton({ onPress, loading }: SignOutButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      accessibilityState={{ busy: loading, disabled: loading }}
      className={`mt-4 h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-north-border bg-north-surface active:opacity-80 ${
        loading ? "opacity-70" : ""
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#f5a19a" size="small" />
      ) : (
        <Lucide name="log-out" size={15} color="#f5a19a" />
      )}
      <Text className="font-inter-semibold text-[12px] leading-[15px] text-north-danger">
        Sign out
      </Text>
    </Pressable>
  );
}
