import { useClerk, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

import { Screen } from "@/components/screen";
import { getClerkErrorMessage } from "@/lib/clerk";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/(auth)/welcome");
    } catch (error) {
      Alert.alert(
        "Couldn't sign out",
        getClerkErrorMessage(error) ?? "Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const name = user?.fullName ?? user?.firstName ?? "Guest";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <Screen>
      <View className="flex-1 gap-2 px-6 pt-6">
        <Text className="text-3xl font-bold text-zinc-900">Profile</Text>
        <Text className="text-base text-zinc-500">{name}</Text>
        {email ? <Text className="text-sm text-zinc-400">{email}</Text> : null}

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          accessibilityState={{ busy: isSigningOut, disabled: isSigningOut }}
          className="mt-6 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-zinc-900 active:opacity-85"
        >
          {isSigningOut ? <ActivityIndicator color="#ffffff" /> : null}
          <Text className="text-sm font-semibold text-white">Sign out</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
