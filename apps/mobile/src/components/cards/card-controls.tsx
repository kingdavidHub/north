import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type ControlId = "online" | "atm" | "contactless";

type Control = {
  id: ControlId;
  title: string;
  description: string;
};

const CONTROLS: Control[] = [
  {
    id: "online",
    title: "Online payments",
    description: "Allow payments on websites",
  },
  {
    id: "atm",
    title: "ATM withdrawals",
    description: "Withdraw cash with your card",
  },
  {
    id: "contactless",
    title: "Contactless payments",
    description: "Tap to pay in stores",
  },
];

const INITIAL_STATE: Record<ControlId, boolean> = {
  online: true,
  atm: false,
  contactless: true,
};

type ControlToggleProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ControlToggle({
  label,
  value,
  onValueChange,
}: ControlToggleProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      aria-checked={value}
      className={`h-[26px] w-[44px] flex-row items-center rounded-full px-[3px] active:opacity-80 ${
        value
          ? "justify-end bg-north-accent"
          : "justify-start bg-north-surface-raised"
      }`}
    >
      <View
        className={`h-5 w-5 rounded-full ${
          value ? "bg-north-bg" : "bg-north-text"
        }`}
      />
    </Pressable>
  );
}

export function CardControls() {
  const [controls, setControls] = useState(INITIAL_STATE);

  const updateControl = (id: ControlId, value: boolean) => {
    setControls((current) => ({ ...current, [id]: value }));
  };

  return (
    <View className="overflow-hidden rounded-2xl border border-north-border bg-north-surface">
      {CONTROLS.map((control, index) => (
        <View
          key={control.id}
          className={`h-16 flex-row items-center gap-3 px-4 ${
            index < CONTROLS.length - 1 ? "border-b border-north-border" : ""
          }`}
        >
          <View className="min-w-0 flex-1">
            <Text className="font-inter-bold text-[13px] leading-[16px] text-north-text">
              {control.title}
            </Text>
            <Text className="mt-0.5 font-inter-regular text-[10px] leading-[12px] text-north-muted">
              {control.description}
            </Text>
          </View>

          <ControlToggle
            label={control.title}
            value={controls[control.id]}
            onValueChange={(value) => updateControl(control.id, value)}
          />
        </View>
      ))}
    </View>
  );
}
