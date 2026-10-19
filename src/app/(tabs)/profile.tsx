import { Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { useAppStore } from "@/store";

export default function ProfileScreen() {
  const user = useAppStore((state) => state.user);

  return (
    <Screen>
      <View className="flex-1 gap-2 px-6 pt-6">
        <Text className="text-3xl font-bold text-zinc-900">Profile</Text>
        <Text className="text-base text-zinc-500">
          {user ? user.name : "Guest"}
        </Text>
      </View>
    </Screen>
  );
}
