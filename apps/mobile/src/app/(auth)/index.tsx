import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/auth/brand-mark";
import { PrimaryButton } from "@/components/auth/primary-button";

export default function WelcomeScreen() {
  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={{ flex: 1, backgroundColor: "#111413" }}
    >
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className="grow px-6 pb-6 pt-6">
          <BrandMark />

          <View className="min-h-6 flex-1" />

          <Image
            source={require("../../../assets/images/north-welcome.png")}
            style={{ width: "100%", maxWidth: 342, aspectRatio: 342 / 330 }}
            contentFit="contain"
            className="self-center"
            accessibilityLabel="NORTH compass illustration"
          />

          <View className="min-h-6 flex-1" />

          <View>
            <Text className="font-inter-medium text-[10px] leading-[12px] text-north-muted">
              YOUR EVERYDAY, IN ONE PLACE
            </Text>
            <Text className="mt-4 font-inter-medium text-[40px] leading-[43px] text-north-text">
              Your money.{"\n"}Your direction.
            </Text>
            <Text className="mt-4 font-inter-regular text-[14px] leading-[23px] text-north-muted">
              Send money, pay for the everyday and keep track of your spending.
              All with NORTH.
            </Text>
          </View>

          <View className="min-h-6 flex-1" />

          <View>
            <PrimaryButton
              label="Get started"
              onPress={() => router.push("/(auth)/signup")}
            />
            <View className="mt-6 flex-row items-center justify-center">
              <Text className="font-inter-regular text-[14px] leading-[17px] text-north-muted">
                Already with NORTH?{" "}
              </Text>
              <Link href="/(auth)/signin" asChild>
                <Pressable hitSlop={8} accessibilityRole="link">
                  <Text className="font-inter-semibold text-[14px] leading-[17px] text-north-accent">
                    Log in
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
