import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#111413" }}>
        <ActivityIndicator color="#d4f77d" style={{ flex: 1 }} />
      </View>
    );
  }

  return <Redirect href={isSignedIn ? "/(tabs)" : "/(auth)/welcome"} />;
}
