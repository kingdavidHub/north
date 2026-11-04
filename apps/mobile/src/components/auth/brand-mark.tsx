import { Image } from "expo-image";
import { Text, View } from "react-native";

export function BrandMark() {
  return (
    <View className="flex-row items-center gap-[9px]">
      <Image
        source={require("../../../assets/images/north-logo.png")}
        style={{ width: 23, height: 23 }}
        contentFit="contain"
        accessibilityLabel="North logo"
      />
      <Text className="font-inter-semibold text-[20px] leading-[24px] text-north-text">
        NORTH
      </Text>
    </View>
  );
}
