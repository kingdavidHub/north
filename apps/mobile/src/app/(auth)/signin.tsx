import { useSignIn } from "@clerk/expo";
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
import { getClerkErrorMessage } from "@/lib/clerk";
import {
  hasValidPhoneLength,
  PHONE_DIAL_CODE,
  toE164PhoneNumber,
} from "@/lib/phone";

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

    if (!values.phone.replace(/\D/g, "")) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter your phone number",
      });
    } else if (!hasValidPhoneLength(values.phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid phone number",
      });
    }
  });

type SignInValues = z.infer<typeof signInSchema>;
type SecondFactor = "email_code" | "phone_code" | "totp";

export default function SignInScreen() {
  const { signIn, errors: clerkErrors, fetchStatus } = useSignIn();
  const [method, setMethod] = useState<LoginMethod>("email");
  const [formError, setFormError] = useState<string | null>(null);
  const [secondFactor, setSecondFactor] = useState<SecondFactor | null>(null);
  const [verificationTarget, setVerificationTarget] = useState("");
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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

  const finishSignIn = async () => {
    const { error } = await signIn.finalize();

    if (error) {
      setFormError(getClerkErrorMessage(error));
      return;
    }

    router.replace("/(tabs)");
  };

  const startSecondFactor = async () => {
    const emailFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === "email_code",
    );
    const phoneFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === "phone_code",
    );
    const totpFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === "totp",
    );

    if (emailFactor) {
      const { error } = await signIn.mfa.sendEmailCode();

      if (error) {
        setFormError(getClerkErrorMessage(error));
        return;
      }

      setSecondFactor("email_code");
      setVerificationTarget(
        signIn.identifier?.includes("@")
          ? signIn.identifier
          : "your email address",
      );
      return;
    }

    if (phoneFactor) {
      const { error } = await signIn.mfa.sendPhoneCode();

      if (error) {
        setFormError(getClerkErrorMessage(error));
        return;
      }

      setSecondFactor("phone_code");
      setVerificationTarget("your phone number");
      return;
    }

    if (totpFactor) {
      setSecondFactor("totp");
      setVerificationTarget("your authenticator app");
      return;
    }

    setFormError(
      "This account needs a verification method that isn't available in the app yet.",
    );
  };

  const onSubmit = async (values: SignInValues) => {
    setFormError(null);

    const email = values.email.trim();
    const phoneNumber = toE164PhoneNumber(values.phone);

    const { error } = await signIn.password(
      values.method === "email"
        ? { emailAddress: email, password: values.password }
        : { phoneNumber, password: values.password },
    );

    if (error) {
      setFormError(getClerkErrorMessage(error));
      return;
    }

    if (signIn.status === "complete") {
      await finishSignIn();
      return;
    }

    if (
      signIn.status === "needs_second_factor" ||
      signIn.status === "needs_client_trust"
    ) {
      await startSecondFactor();
      return;
    }

    if (signIn.status === "needs_new_password") {
      setFormError(
        "Your password needs to be reset. Use “Forgot password?” to start over.",
      );
      return;
    }

    setFormError("We couldn't finish signing you in. Please try again.");
  };

  const onVerify = async () => {
    if (!secondFactor || !code.trim()) {
      return;
    }

    setIsVerifying(true);
    setFormError(null);

    try {
      const normalizedCode = code.trim();
      const { error } =
        secondFactor === "email_code"
          ? await signIn.mfa.verifyEmailCode({ code: normalizedCode })
          : secondFactor === "phone_code"
            ? await signIn.mfa.verifyPhoneCode({ code: normalizedCode })
            : await signIn.mfa.verifyTOTP({ code: normalizedCode });

      if (error) {
        setFormError(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      setFormError("That code didn't complete the sign-in. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async () => {
    if (secondFactor !== "email_code" && secondFactor !== "phone_code") {
      return;
    }

    setFormError(null);

    const { error } =
      secondFactor === "email_code"
        ? await signIn.mfa.sendEmailCode()
        : await signIn.mfa.sendPhoneCode();

    if (error) {
      setFormError(getClerkErrorMessage(error));
      return;
    }

    Alert.alert("Code sent", "A new verification code is on its way.");
  };

  const resetSignIn = async () => {
    await signIn.reset();
    setSecondFactor(null);
    setVerificationTarget("");
    setCode("");
    setFormError(null);
  };

  const changeMethod = (nextMethod: LoginMethod) => {
    setMethod(nextMethod);
    setValue("method", nextMethod);
    clearErrors(["email", "phone"]);
    setFormError(null);
    void signIn.reset();
  };

  const showCountryCodes = () => {
    Alert.alert(
      "Country code",
      `Only ${PHONE_DIAL_CODE} (Nigeria) is available in this build.`,
    );
  };

  const showPasswordReset = () => {
    Alert.alert(
      "Forgot password?",
      "Password reset will be available once the North API is connected.",
    );
  };

  if (secondFactor) {
    const isTotp = secondFactor === "totp";

    return (
      <AuthLayout header={<BrandMark />}>
        <View className="mt-[74px]">
          <Text className="font-inter-medium text-[34px] leading-[39px] text-north-text">
            Verify it&apos;s you.
          </Text>
          <Text className="mt-3 font-inter-regular text-[14px] leading-[22px] text-north-muted">
            {isTotp
              ? "Enter the 6-digit code from your authenticator app."
              : `We sent a 6-digit code to ${verificationTarget}.`}
          </Text>
        </View>

        <View className="mt-8">
          <TextField
            label={isTotp ? "Authenticator code" : "Verification code"}
            placeholder="Enter the 6-digit code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            returnKeyType="go"
            maxLength={6}
            value={code}
            onChangeText={setCode}
            error={clerkErrors.fields.code?.message}
            onSubmitEditing={() => {
              void onVerify();
            }}
          />
        </View>

        {formError ? (
          <Text className="mt-4 font-inter-regular text-[13px] leading-5 text-north-danger">
            {formError}
          </Text>
        ) : null}

        <View className="mt-6">
          <PrimaryButton
            label="Verify"
            onPress={onVerify}
            loading={isVerifying || fetchStatus === "fetching"}
          />
        </View>

        <View className="mt-6 items-center gap-4">
          {isTotp ? null : (
            <Pressable
              onPress={resendCode}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text className="font-inter-medium text-[13px] leading-[16px] text-north-accent">
                Resend code
              </Text>
            </Pressable>
          )}
          <Pressable
            onPress={resetSignIn}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text className="font-inter-regular text-[13px] leading-[16px] text-north-muted">
              Use a different account
            </Text>
          </Pressable>
        </View>
      </AuthLayout>
    );
  }

  const identifierError = clerkErrors.fields.identifier?.message;
  const isBusy = isSubmitting || fetchStatus === "fetching";

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
                error={errors.email?.message ?? identifierError}
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
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message ?? identifierError}
                leading={
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-regular text-[14px] text-north-text">
                      {PHONE_DIAL_CODE}
                    </Text>
                    <Pressable
                      onPress={showCountryCodes}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Country code, Nigeria ${PHONE_DIAL_CODE}`}
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
              error={errors.password?.message ?? clerkErrors.fields.password?.message}
              onSubmitEditing={() => {
                void handleSubmit(onSubmit)();
              }}
            />
          )}
        />
      </View>

      {formError ? (
        <Text className="mt-4 font-inter-regular text-[13px] leading-5 text-north-danger">
          {formError}
        </Text>
      ) : null}

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
        loading={isBusy}
      />
    </AuthLayout>
  );
}
