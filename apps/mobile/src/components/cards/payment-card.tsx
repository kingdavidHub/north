import { Image } from "expo-image";
import { Alert, Pressable, Text, View } from "react-native";

import { Lucide } from "@/icons";

import { StatusPill } from "./status-pill";

function handleManageCard() {
  Alert.alert(
    "Manage card",
    "Card settings will be available once the North API is connected.",
  );
}

export function PaymentCard() {
  return (
    <View className="overflow-hidden rounded-[24px] border border-north-border bg-north-surface">
      <View className="px-5 pb-4 pt-5">
        <View className="flex-row items-start justify-between gap-4">
          <View>
            <View className="flex-row items-center gap-[7px]">
              <Image
                source={require("../../../assets/images/north-logo.png")}
                style={{ width: 13, height: 13 }}
                contentFit="contain"
                accessibilityLabel="North logo"
              />
              <Text
                style={{ letterSpacing: 2 }}
                className="font-inter-bold text-[14px] leading-[17px] text-north-text"
              >
                NORTH
              </Text>
            </View>
            <Text className="mt-1 font-inter-regular text-[11px] leading-[13.3px] text-north-muted">
              Everyday
            </Text>
          </View>

          <StatusPill status="active" />
        </View>

        <Text
          style={{ letterSpacing: 1.2 }}
          className="mt-[18px] font-inter-bold text-[19px] leading-[23px] text-north-text"
        >
          •••• •••• •••• 4821
        </Text>

        <View className="mt-[18px] flex-row items-end justify-between gap-4">
          <View className="min-w-0 flex-row items-center gap-[10px]">
            <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-north-accent">
              <Text className="font-inter-bold text-[13px] leading-[16px] text-north-bg">
                DK
              </Text>
            </View>

            <View className="min-w-0">
              <Text
                style={{ letterSpacing: 0.7 }}
                className="font-inter-bold text-[10px] leading-[12px] text-north-text"
              >
                DAVID K.
              </Text>
              <Text
                numberOfLines={1}
                className="mt-0.5 font-inter-regular text-[10px] leading-[12px] text-north-muted"
              >
                Primary spending card
              </Text>
            </View>
          </View>

          <Text
            style={{ letterSpacing: 1.4 }}
            className="pb-0.5 font-inter-bold text-[11px] leading-[13.3px] text-north-text"
          >
            VISA
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handleManageCard}
        accessibilityRole="button"
        accessibilityLabel="Manage card"
        className="h-[46px] flex-row items-center justify-between border-t border-north-border px-5 active:opacity-75"
      >
        <Text className="font-inter-bold text-[13px] leading-[16px] text-north-accent">
          Manage card
        </Text>
        <View className="h-6 w-6 items-center justify-center rounded-full bg-north-surface-raised">
          <Lucide name="arrow-up-right" size={12} color="#fafcf6" />
        </View>
      </Pressable>
    </View>
  );
}
