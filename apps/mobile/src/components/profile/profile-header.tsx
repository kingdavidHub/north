import { Text, View } from "react-native";

export function ProfileHeader() {
  return (
    <View className="h-[50px] justify-center">
      <Text className="font-inter-bold text-[11px] leading-[13.3px] text-north-muted">
        YOUR ACCOUNT
      </Text>
      <Text className="mt-1 font-inter-bold text-[28px] leading-[34px] text-north-text">
        Profile
      </Text>
    </View>
  );
}
