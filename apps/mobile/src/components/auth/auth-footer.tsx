import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

type AuthFooterProps = {
  prompt: string;
  action: string;
  href: Href;
};

export function AuthFooter({ prompt, action, href }: AuthFooterProps) {
  return (
    <View className="border-t border-north-border pt-6">
      <View className="flex-row items-center justify-center">
        <Text className="font-inter-regular text-[14px] leading-[17px] text-north-muted">
          {prompt}{" "}
        </Text>
        <Link href={href} asChild>
          <Pressable hitSlop={8} accessibilityRole="link">
            <Text className="font-inter-semibold text-[14px] leading-[17px] text-north-accent">
              {action}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
