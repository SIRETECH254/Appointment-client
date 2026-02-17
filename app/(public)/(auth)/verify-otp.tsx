import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();

  // Single form object to send as the verify OTP payload.
  const [form, setForm] = useState({ email: '', otp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Form submission handler (validates + calls verifyOTP).
  const handleSubmit = useCallback(async (otpValue?: string) => {
    const trimmedEmail = form.email.trim();
    const otpToVerify = otpValue || form.otp;

    if (!trimmedEmail || !otpToVerify || otpToVerify.length !== 6) {
      setInlineError('Please enter your email and a valid 6-digit OTP.');
      return;
    }

    // Clear old errors and start the button loader.
    setInlineError(null);
    setIsSubmitting(true);

    try {
      // Send the form object as the verify OTP payload.
      const result = await verifyOTP({ email: trimmedEmail, otp: otpToVerify });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to verify OTP.');
        return;
      }

      // Redirect to the authenticated landing page.
      router.replace('/(authenticated)/(tabs)/profile');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form.email, form.otp, verifyOTP, router]);

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      if (name === 'otp') {
        // Only allow digits, max 6 characters
        const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
        setForm((previous) => ({ ...previous, [name]: digitsOnly }));
        // Auto-submit when 6 digits entered
        if (digitsOnly.length === 6) {
          setTimeout(() => handleSubmit(digitsOnly), 100);
        }
      } else {
        setForm((previous) => ({ ...previous, [name]: value }));
      }
      if (error) {
        clearError();
      }
      setInlineError(null);
    },
    [error, clearError, handleSubmit],
  );

  // Derived flag for button state and validation.
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.otp.length === 6) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.otp, isSubmitting, isLoading],
  );

  // Resend OTP handler.
  const handleResend = useCallback(async () => {
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      setInlineError('Please enter your email address.');
      return;
    }

    setInlineError(null);
    setIsResending(true);

    try {
      const result = await resendOTP({ email: trimmedEmail });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to resend OTP.');
        return;
      }

      // Start countdown
      setResendCountdown(60);
      setCanResend(false);
    } finally {
      setIsResending(false);
    }
  }, [form.email, resendOTP]);

  // Countdown effect for resend button.
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Prefer inline error over global auth error for display.
  const bannerMessage = inlineError || error;

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Verify OTP</Text>
          <Text className="auth-subtitle">
            Enter the code sent to your email address.
          </Text>
        </View>

        {/* Form */}
        <View className="auth-form w-full">
          {/* Email field */}
          <View className="auth-field">
            <Text className="label">Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(value) => handleInputChange('email', value)}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="user@example.com"
              className="input"
            />
          </View>

          {/* OTP field */}
          <View className="auth-field">
            <Text className="label">OTP Code</Text>
            <TextInput
              value={form.otp}
              onChangeText={(value) => handleInputChange('otp', value)}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              className="input text-center text-2xl font-semibold tracking-[0.5em]"
            />
          </View>

          {/* Resend OTP button */}
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend}
            className={`${!canResend ? 'opacity-50' : ''}`}>
            <Text className="auth-link">
              {canResend ? 'Resend OTP' : `Resend OTP (${resendCountdown}s)`}
            </Text>
          </TouchableOpacity>

          {/* Error banner */}
          {bannerMessage ? (
            <Text className="auth-inline-message-error">{bannerMessage}</Text>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            onPress={() => handleSubmit()}
            disabled={!canSubmit}
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
            {isSubmitting || isLoading ? 'Verifying...' : 'Verify'}
          </TouchableOpacity>
        </View>

        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Back to <Text className="font-semibold text-brand-primary">sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
