import type { ReactNode } from "react";
import { useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewInstance,
} from "react-native";

import { useKeyboardAwareField } from "@/components/keyboard-aware-scroll-view";
import { Lucide } from "@/icons";

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  secure?: boolean;
  leading?: ReactNode;
};

export function TextField({
  label,
  error,
  secure = false,
  leading,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef<ViewInstance>(null);
  const scrollFieldIntoView = useKeyboardAwareField();

  const borderColor = error
    ? "border-north-danger"
    : focused
      ? "border-north-accent"
      : "border-north-border";

  return (
    <View ref={containerRef} collapsable={false}>
      <Text className="mb-[10px] font-inter-medium text-[13px] leading-[16px] text-north-text">
        {label}
      </Text>

      <View
        className={`h-[58px] flex-row items-center gap-3 rounded-xl border bg-north-surface px-4 ${borderColor}`}
      >
        {leading}

        <TextInput
          {...inputProps}
          className="flex-1 py-0 font-inter-regular text-[14px] text-north-text"
          placeholderTextColor="#a6b0a8"
          selectionColor="#d4f77d"
          underlineColorAndroid="transparent"
          secureTextEntry={secure && !revealed}
          accessibilityLabel={label}
          onFocus={(event) => {
            setFocused(true);
            scrollFieldIntoView?.(containerRef);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            className="h-5 w-5 items-center justify-center"
          >
            <Lucide
              name={revealed ? "eye-off" : "eye"}
              size={20}
              color="#a6b0a8"
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text className="mt-1.5 font-inter-regular text-xs text-north-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
