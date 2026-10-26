import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren, ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyboardAwareScrollView } from "@/components/keyboard-aware-scroll-view";

type AuthLayoutProps = PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
}>;

export function AuthLayout({ children, header, footer }: AuthLayoutProps) {
  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={{ flex: 1, backgroundColor: "#111413" }}
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pb-6 pt-6">
            <View>
              {header}
              {children}
            </View>
            <View className="flex-1" />
            {footer}
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
