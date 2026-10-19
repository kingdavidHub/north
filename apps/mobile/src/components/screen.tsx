import type { ComponentProps } from "react";
import { styled } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView, { className: "style" });

const DEFAULT_EDGES: NonNullable<ComponentProps<typeof StyledSafeAreaView>["edges"]> = [
  "top",
  "left",
  "right",
];

type ScreenProps = ComponentProps<typeof StyledSafeAreaView>;

export function Screen({ className, edges = DEFAULT_EDGES, ...props }: ScreenProps) {
  return (
    <StyledSafeAreaView
      className={`flex-1 bg-white ${className ?? ""}`}
      edges={edges}
      {...props}
    />
  );
}
