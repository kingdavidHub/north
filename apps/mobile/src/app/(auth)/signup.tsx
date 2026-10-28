import { useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, View } from "react-native";
import { z } from "zod";

import { AuthFooter } from "@/components/auth/auth-footer";
import { AuthLayout } from "@/components/auth/auth-layout";
import { BrandMark } from "@/components/auth/brand-mark";
import { Checkbox } from "@/components/auth/checkbox";
import { PrimaryButton } from "@/components/auth/primary-button";
import { TextField } from "@/components/auth/text-field";
import { Lucide } from "@/icons";
import { getClerkErrorMessage, isUnsupportedCountryError } from "@/lib/clerk";
import {
  hasValidPhoneLength,
  PHONE_DIAL_CODE,
  splitFullName,
  toE164PhoneNumber,
} from "@/lib/phone";

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
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || hasValidPhoneLength(value),
      "Enter a valid phone number",
    ),
  password: z
    .string()
    .min(15, "Use at least 15 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
  terms: z
    .boolean()
    .refine((accepted) => accepted, "Accept the terms to create an account"),
});

type SignUpValues = z.infer<typeof signUpSchema>;
type VerificationTarget = "email" | "phone";

export default function SignUpScreen() {
  const { signUp, errors: clerkErrors, fetchStatus } = useSignUp();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [verificationPhone, setVerificationPhone] = useState<string | null>(
    null,
  );
  const [phoneVerificationSkipped, setPhoneVerificationSkipped] =
    useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      terms: false,
    },
    mode: "onTouched",
  });

  const finishSignUp = async () => {
    const { error } = await signUp.finalize();

    if (error) {
      setFormError(getClerkErrorMessage(error));
      return;
    }

    router.replace("/(tabs)");
  };

  const onSubmit = async (values: SignUpValues) => {
    setFormError(null);
    setPhoneVerificationSkipped(false);

    const { firstName, lastName } = splitFullName(values.name);
    const enteredPhone = values.phone ? toE164PhoneNumber(values.phone) : null;
    let phoneNumber = enteredPhone;

    setVerificationPhone(phoneNumber);

    const submit = (candidatePhone: string | null) =>
      signUp.password({
        emailAddress: values.email.trim(),
        ...(candidatePhone ? { phoneNumber: candidatePhone } : {}),
        // Kept on the user record so the number can be saved to our database
        // later, even when Clerk can't verify it.
        ...(enteredPhone
          ? { unsafeMetadata: { phoneNumber: enteredPhone } }
          : {}),
        password: values.password,
        firstName,
        lastName,
      });

    let { error } = await submit(phoneNumber);

    // Clerk rejects SMS to unsupported countries. Keep the number for later
    // persistence and continue with email verification instead of failing.
    if (enteredPhone && error && isUnsupportedCountryError(error)) {
      if (__DEV__) {
        console.warn("[Clerk] phone country unsupported; verifying email only");
      }

      await signUp.reset();
      phoneNumber = null;
      setVerificationPhone(null);
      setPhoneVerificationSkipped(true);

      ({ error } = await submit(null));
    }

    if (error) {
      if (__DEV__) {
        console.warn("[Clerk] sign-up failed", error);
      }

      setFormError(getClerkErrorMessage(error));
      return;
    }

    if (signUp.status === "complete") {
      await finishSignUp();
      return;
    }

    const needsEmailCode = signUp.unverifiedFields.includes("email_address");
    const needsPhoneCode =
      Boolean(phoneNumber) &&
      signUp.unverifiedFields.includes("phone_number");

    if (!needsEmailCode && !needsPhoneCode) {
      setFormError(
        "We couldn't finish creating your account. Please try again.",
      );
      return;
    }

    setStep("verify");

    if (needsEmailCode) {
      const { error: sendError } = await signUp.verifications.sendEmailCode();

      if (sendError) {
        setFormError(getClerkErrorMessage(sendError));
        return;
      }
    }

    if (needsPhoneCode) {
      const { error: sendError } = await signUp.verifications.sendPhoneCode();

      if (sendError) {
        setFormError(getClerkErrorMessage(sendError));
      }
    }
  };

  const onVerify = async () => {
    setIsVerifying(true);
    setFormError(null);

    try {
      const needsEmailCode = signUp.unverifiedFields.includes("email_address");
      const needsPhoneCode =
        Boolean(verificationPhone) &&
        signUp.unverifiedFields.includes("phone_number");

      if (needsEmailCode) {
        if (!emailCode.trim()) {
          setFormError("Enter the code sent to your email.");
          return;
        }

        const { error } = await signUp.verifications.verifyEmailCode({
          code: emailCode.trim(),
        });

        if (error) {
          setFormError(getClerkErrorMessage(error));
          return;
        }
      }

      if (needsPhoneCode) {
        if (!phoneCode.trim()) {
          setFormError("Enter the code sent to your phone.");
          return;
        }

        const { error } = await signUp.verifications.verifyPhoneCode({
          code: phoneCode.trim(),
        });

        if (error) {
          setFormError(getClerkErrorMessage(error));
          return;
        }
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      setFormError(
        "That code didn't complete your sign-up. Please try again.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const resendCode = async (target: VerificationTarget) => {
    setFormError(null);

    const { error } =
      target === "email"
        ? await signUp.verifications.sendEmailCode()
        : await signUp.verifications.sendPhoneCode();

    if (error) {
      setFormError(getClerkErrorMessage(error));
      return;
    }

    Alert.alert(
      "Code sent",
      `A new verification code was sent to your ${target}.`,
    );
  };

  const resetSignUp = async () => {
    await signUp.reset();
    setStep("form");
    setEmailCode("");
    setPhoneCode("");
    setVerificationPhone(null);
    setPhoneVerificationSkipped(false);
    setFormError(null);
  };

  const showCountryCodes = () => {
    Alert.alert(
      "Country code",
      `Only ${PHONE_DIAL_CODE} (Nigeria) is available in this build.`,
    );
  };

  const showLegal = (title: string) => {
    Alert.alert(title, `${title} content will be available before launch.`);
  };

  if (step === "verify") {
    const needsEmailCode = signUp.unverifiedFields.includes("email_address");
    const needsPhoneCode =
      Boolean(verificationPhone) &&
      signUp.unverifiedFields.includes("phone_number");

    return (
      <AuthLayout header={<BrandMark />}>
        <View className="mt-[74px]">
          <Text className="font-inter-medium text-[34px] leading-[39px] text-north-text">
            Verify your details.
          </Text>
          <Text className="mt-3 font-inter-regular text-[14px] leading-[22px] text-north-muted">
            {verificationPhone
              ? "Enter the verification codes we sent to your email and phone number."
              : "Enter the verification code we sent to your email."}
          </Text>
          {phoneVerificationSkipped ? (
            <Text className="mt-3 font-inter-regular text-[13px] leading-5 text-north-muted">
              We couldn&apos;t send a code to your phone, so we&apos;ll verify
              your email instead.
            </Text>
          ) : null}
        </View>

        <View className="mt-8 gap-6">
          {needsEmailCode ? (
            <TextField
              label="Email verification code"
              placeholder="Enter the 6-digit code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="next"
              maxLength={6}
              value={emailCode}
              onChangeText={setEmailCode}
              error={clerkErrors.fields.code?.message}
            />
          ) : null}

          {needsPhoneCode ? (
            <TextField
              label="Phone verification code"
              placeholder="Enter the 6-digit code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              returnKeyType="go"
              maxLength={6}
              value={phoneCode}
              onChangeText={setPhoneCode}
              error={clerkErrors.fields.code?.message}
              onSubmitEditing={() => {
                void onVerify();
              }}
            />
          ) : null}
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
          {needsEmailCode ? (
            <Pressable
              onPress={() => void resendCode("email")}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text className="font-inter-medium text-[13px] leading-[16px] text-north-accent">
                Resend email code
              </Text>
            </Pressable>
          ) : null}

          {needsPhoneCode ? (
            <Pressable
              onPress={() => void resendCode("phone")}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text className="font-inter-medium text-[13px] leading-[16px] text-north-accent">
                Resend phone code
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={resetSignUp}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text className="font-inter-regular text-[13px] leading-[16px] text-north-muted">
              Start over
            </Text>
          </Pressable>
        </View>
      </AuthLayout>
    );
  }

  const isBusy = isSubmitting || fetchStatus === "fetching";

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
              error={
                errors.name?.message ??
                clerkErrors.fields.firstName?.message ??
                clerkErrors.fields.lastName?.message
              }
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
              error={
                errors.email?.message ??
                clerkErrors.fields.emailAddress?.message
              }
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Phone number (optional)"
              placeholder="801 234 5678"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="next"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={
                errors.phone?.message ?? clerkErrors.fields.phoneNumber?.message
              }
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
                    <Lucide name="chevron-down" size={12} color="#a6b0a8" />
                  </Pressable>
                  <View className="h-[22px] w-px bg-north-border" />
                </View>
              }
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Password"
              placeholder="At least 15 characters"
              secure
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={
                errors.password?.message ??
                clerkErrors.fields.password?.message
              }
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
              error={
                errors.terms?.message ??
                clerkErrors.fields.legalAccepted?.message
              }
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

      {formError ? (
        <Text className="mt-4 font-inter-regular text-[13px] leading-5 text-north-danger">
          {formError}
        </Text>
      ) : null}

      <View className="mt-6">
        <PrimaryButton
          label="Create account"
          onPress={handleSubmit(onSubmit)}
          loading={isBusy}
        />
      </View>

      {/* Required for sign-up flows if legacy bot protection is enabled. */}
      <View nativeID="clerk-captcha" />
    </AuthLayout>
  );
}
