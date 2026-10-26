import { Stack } from "expo-router";

const layout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#111413" },
        animation: "fade",
      }}
    />
  );
};

export default layout;
