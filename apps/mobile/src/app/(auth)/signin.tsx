import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, View } from "react-native";
import { z } from "zod";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandMark } from "@/components/auth/brand-mark";
import {
  LoginMethodToggle,
  type LoginMethod,
} from "@/components/auth/login-method-toggle";
import { PrimaryButton } from "@/components/auth/primary-button";
import { TextField } from "@/components/auth/text-field";
import { Lucide } from "@/icons";
import { useAppStore } from "@/store";

const signInSchema = z
  .object({
    method: z.enum(["email", "phone"]),
    email: z.string(),
    phone: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .superRefine((values, ctx) => {
    if (values.method === "email") {
      const email = values.email.trim();

      if (!email) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter your email address",
        });
      } else if (!z.email().safeParse(email).success) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter a valid email address",
        });
      }

      return;
    }

    const digits = values.phone.replace(/\D/g, "");

    if (!digits) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter your phone number",
      });
    } else if (digits.length < 7 || digits.length > 15) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid phone number",
      });
    }
  });

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const setUser = useAppStore((state) => state.setUser);
  const [method, setMethod] = useState<LoginMethod>("email");

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      method: "email",
      email: "",
      phone: "",
      password: "",
    },
    mode: "onTouched",
  });

  const changeMethod = (nextMethod: LoginMethod) => {
    setMethod(nextMethod);
    setValue("method", nextMethod);
    clearErrors(["email", "phone"]);
  };

  const onSubmit = async (values: SignInValues) => {
    // TODO: replace with the North API sign-in call once auth is available.
    await new Promise((resolve) => setTimeout(resolve, 700));

    const email = values.email.trim();
    const phone = `+234${values.phone.replace(/\D/g, "").replace(/^0/, "")}`;

    setUser({
      id: "demo-user",
      name:
        values.method === "email"
          ? (email.split("@")[0] ?? "North user")
          : "North user",
      email: values.method === "email" ? email : "",
      phone: values.method === "phone" ? phone : undefined,
    });
    router.replace("/(tabs)");
  };

  const showCountryCodes = () => {
    Alert.alert(
      "Country code",
      "Only +234 (Nigeria) is available in this build.",
    );
  };

  const showPasswordReset = () => {
    Alert.alert(
      "Forgot password?",
      "Password reset will be available once the North API is connected.",
    );
  };

  return (
    <AuthLayout
      header={<BrandMark />}
      footer={
        <AuthFooter
          prompt="New to NORTH?"
          action="Sign up"
          href="/(auth)/signup"
        />
      }
    >
      <View className="mt-[74px]">
        <Text className="font-inter-medium text-[34px] leading-[39px] text-north-text">
          Welcome back.
        </Text>
        <Text className="mt-3 font-inter-regular text-[14px] leading-[22px] text-north-muted">
          Log in to pick up where you left off.
        </Text>
      </View>

      <View className="mt-8">
        <LoginMethodToggle value={method} onChange={changeMethod} />
      </View>

      <View className="mt-7 gap-6">
        {method === "email" ? (
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />
        ) : (
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Phone number"
                placeholder="801 234 5678"
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                // returnKeyType="next"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                leading={
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-regular text-[14px] text-north-text">
                      +234
                    </Text>
                    <Pressable
                      onPress={showCountryCodes}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Country code, Nigeria +234"
                    >
                      <Lucide
                        name="chevron-down"
                        size={12}
                        color="#a6b0a8"
                      />
                    </Pressable>
                    <View className="h-[22px] w-px bg-north-border" />
                  </View>
                }
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Password"
              placeholder="Enter your password"
              secure
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              onSubmitEditing={() => {
                void handleSubmit(onSubmit)();
              }}
            />
          )}
        />
      </View>

      <View className="items-end pb-8 pt-4">
        <Pressable
          onPress={showPasswordReset}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text className="font-inter-medium text-[13px] leading-[16px] text-north-accent">
            Forgot password?
          </Text>
        </Pressable>
      </View>

      <PrimaryButton
        label="Log in"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </AuthLayout>
  );
}
