import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Lucide } from "@/icons";

type ActivitySearchProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ActivitySearch({ value, onChangeText }: ActivitySearchProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`h-12 flex-row items-center gap-[10px] rounded-2xl border bg-north-surface pl-[13px] pr-[15px] ${
        focused ? "border-north-accent" : "border-north-border"
      }`}
    >
      <Lucide name="search" size={18} color="#a6b0a8" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search transactions"
        placeholderTextColor="#a6b0a8"
        selectionColor="#d4f77d"
        underlineColorAndroid="transparent"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search transactions"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="min-w-0 flex-1 py-0 font-inter-regular text-[13px] leading-[16px] text-north-text"
        style={{
          outlineColor: "transparent",
          outlineStyle: "solid",
          outlineWidth: 0,
          paddingVertical: 0,
        }}
      />

      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="h-5 w-5 items-center justify-center active:opacity-70"
        >
          <Lucide name="x" size={16} color="#a6b0a8" />
        </Pressable>
      ) : null}
    </View>
  );
}
