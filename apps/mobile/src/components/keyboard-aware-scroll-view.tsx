import type { PropsWithChildren, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Keyboard,
  ScrollView,
  View,
  type ScrollViewInstance,
  type ScrollViewProps,
  type ViewInstance,
} from "react-native";

type FieldRef = RefObject<ViewInstance | null>;
type ScrollFieldIntoView = (field: FieldRef) => void;

const KeyboardAwareScrollContext =
  createContext<ScrollFieldIntoView | null>(null);

export function useKeyboardAwareField() {
  return useContext(KeyboardAwareScrollContext);
}

type KeyboardAwareScrollViewProps = ScrollViewProps &
  PropsWithChildren<{
    bottomOffset?: number;
  }>;

export function KeyboardAwareScrollView({
  children,
  bottomOffset = 24,
  onScroll,
  ...scrollProps
}: KeyboardAwareScrollViewProps) {
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const viewportRef = useRef<ViewInstance>(null);
  const scrollOffset = useRef(0);
  const focusedField = useRef<FieldRef | null>(null);

  const scrollFieldIntoView = useCallback(
    (field: FieldRef) => {
      viewportRef.current?.measureInWindow(
        (_x, viewportY, _width, viewportHeight) => {
          field.current?.measureInWindow(
            (_fieldX, fieldY, _fieldWidth, fieldHeight) => {
              const overflow =
                fieldY +
                fieldHeight +
                bottomOffset -
                (viewportY + viewportHeight);

              if (overflow > 0) {
                scrollViewRef.current?.scrollTo({
                  y: scrollOffset.current + overflow,
                  animated: true,
                });
              }
            },
          );
        },
      );
    },
    [bottomOffset],
  );

  const handleFieldFocus = useCallback(
    (field: FieldRef) => {
      focusedField.current = field;
      requestAnimationFrame(() => scrollFieldIntoView(field));
    },
    [scrollFieldIntoView],
  );

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => {
        if (focusedField.current) {
          scrollFieldIntoView(focusedField.current);
        }
      });
    });

    return () => subscription.remove();
  }, [scrollFieldIntoView]);

  return (
    <KeyboardAwareScrollContext.Provider value={handleFieldFocus}>
      <View ref={viewportRef} className="flex-1" collapsable={false}>
        <ScrollView
          {...scrollProps}
          ref={scrollViewRef}
          onScroll={(event) => {
            scrollOffset.current = event.nativeEvent.contentOffset.y;
            onScroll?.(event);
          }}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      </View>
    </KeyboardAwareScrollContext.Provider>
  );
}
