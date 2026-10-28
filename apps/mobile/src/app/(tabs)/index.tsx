import { useUser } from "@clerk/expo";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BalancePanel } from "@/components/home/balance-panel";
import { DebitCardRow } from "@/components/home/debit-card-row";
import { HomeHeader } from "@/components/home/home-header";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentActivity } from "@/components/home/recent-activity";
import { SpendingPanel } from "@/components/home/spending-panel";

export default function HomeScreen() {
  const { user } = useUser();
  const name = user?.firstName ?? user?.fullName ?? "";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: "#111413" }}
    >
      <StatusBar style="light" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          gap: 24,
          paddingBottom: 20,
          paddingHorizontal: 24,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader name={name} />
        <BalancePanel />
        <DebitCardRow />
        <QuickActions />
        <SpendingPanel />
        <RecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
}
