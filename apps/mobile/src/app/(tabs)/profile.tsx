import { useClerk, useUser } from "@clerk/expo";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileIdentity } from "@/components/profile/profile-identity";
import { ProfileMenu } from "@/components/profile/profile-menu";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { getClerkErrorMessage } from "@/lib/clerk";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
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
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.primaryPhoneNumber?.phoneNumber;
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: "#111413" }}
    >
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 24,
          paddingHorizontal: 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        <View className="mt-4">
          <ProfileIdentity name={name} email={email} />
        </View>

        <View className="mt-6">
          <ProfileMenu />
        </View>

        <SignOutButton onPress={handleSignOut} loading={isSigningOut} />

        <Text className="mt-5 text-center font-inter-regular text-[10px] leading-[12px] text-north-muted">
          North version {version}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
