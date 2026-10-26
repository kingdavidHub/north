import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, View } from "react-native";
import { z } from "zod";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandMark } from "@/components/auth/brand-mark";
import { Checkbox } from "@/components/auth/checkbox";
import { PrimaryButton } from "@/components/auth/primary-button";
import { TextField } from "@/components/auth/text-field";
import { useAppStore } from "@/store";

const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "That name is a little too long"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  terms: z
    .boolean()
    .refine((accepted) => accepted, "Accept the terms to create an account"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const setUser = useAppStore((state) => state.setUser);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", terms: false },
    mode: "onTouched",
  });

  const onSubmit = async (values: SignUpValues) => {
    // TODO: replace with the North API registration call once auth is available.
    await new Promise((resolve) => setTimeout(resolve, 800));

    setUser({
      id: "demo-user",
      name: values.name,
      email: values.email,
    });
    router.replace("/(tabs)");
  };

  const showLegal = (title: string) => {
    Alert.alert(title, `${title} content will be available before launch.`);
  };

  return (
    <AuthLayout
      header={<BrandMark />}
      footer={
        <AuthFooter
          prompt="Already with NORTH?"
          action="Log in"
          href="/(auth)/signin"
        />
      }
    >
      <View className="mt-[74px]">
        <Text className="font-inter-medium text-[34px] leading-[39px] text-north-text">
          Create your account.
        </Text>
        <Text className="mt-3 font-inter-regular text-[14px] leading-[22px] text-north-muted">
          Your everyday, in one place. Set up your NORTH account in a minute.
        </Text>
      </View>

      <View className="mt-8 gap-6">
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              placeholder="Ada Lovelace"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />

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
              autoComplete="new-password"
              textContentType="newPassword"
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

      <View className="mt-6">
        <Controller
          control={control}
          name="terms"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              checked={value}
              onChange={onChange}
              error={errors.terms?.message}
              label={
                <Text
                  onPress={() => onChange(!value)}
                  className="font-inter-regular text-[13px] leading-5 text-north-muted"
                >
                  I agree to NORTH&apos;s{" "}
                  <Text
                    onPress={() => showLegal("Terms of Service")}
                    className="font-inter-medium text-north-accent"
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    onPress={() => showLegal("Privacy Policy")}
                    className="font-inter-medium text-north-accent"
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              }
            />
          )}
        />
      </View>

      <View className="mt-6">
        <PrimaryButton
          label="Create account"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </View>
    </AuthLayout>
  );
}
