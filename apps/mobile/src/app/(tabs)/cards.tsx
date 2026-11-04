import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CardControls } from "@/components/cards/card-controls";
import { CardsHeader } from "@/components/cards/cards-header";
import { ManagedCards } from "@/components/cards/managed-cards";
import { PaymentCard } from "@/components/cards/payment-card";

export default function CardsScreen() {
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
        <CardsHeader />

        <View className="mt-5">
          <PaymentCard />
        </View>

        <Text className="mt-6 font-inter-bold text-[17px] leading-[21px] text-north-text">
          Manage your cards
        </Text>
        <View className="mt-3">
          <ManagedCards />
        </View>

        <Text className="mt-6 font-inter-bold text-[17px] leading-[21px] text-north-text">
          Card controls
        </Text>
        <View className="mt-3">
          <CardControls />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
