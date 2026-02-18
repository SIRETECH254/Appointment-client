import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

export default function VerifyOTPScreen() {
  const router = useRouter();
  // useAuth provides verifyOTP, resendOTP functions, loading state, global errors, and error clearing.
  const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();

  // State for form inputs (email, otp), submission status, resending status, and countdown.
  const [form, setForm] = useState({ email: '', otp: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // handleSubmit: Called when the 'Verify' TouchableOpacity is pressed, or auto-triggered for OTP.
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
      // Calls the verifyOTP function from AuthContext to verify the OTP.
      const result = await verifyOTP({ email: trimmedEmail, otp: otpToVerify });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to verify OTP.');
        return;
      }

      // Redirect to the authenticated profile page upon successful OTP verification.
      // NOTE: This navigation target might need to be adjusted based on app flow (e.g., to home page).
      router.replace('/(authenticated)/(tabs)/profile');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form.email, form.otp, verifyOTP, router]);

  // handleInputChange: Updates form state when TextInput components' values change.
  // Includes special logic for OTP input to auto-submit.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      if (name === 'otp') {
        // Only allow digits, max 6 characters
        const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
        setForm((previous) => ({ ...previous, [name]: digitsOnly }));
        // Auto-submit when 6 digits entered
        if (digitsOnly.length === 6) {
          setTimeout(() => handleSubmit(digitsOnly), 100); // Auto-triggers handleSubmit.
        }
      } else {
        setForm((previous) => ({ ...previous, [name]: value }));
      }
      if (error) {
        clearError(); // Clears global auth errors.
      }
      setInlineError(null); // Clears local inline errors.
    },
    [error, clearError, handleSubmit],
  );

  // canSubmit: Memoized value indicating if the form can be submitted.
  // This controls the 'disabled' prop of the submit TouchableOpacity.
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.otp.length === 6) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.otp, isSubmitting, isLoading],
  );

  // handleResend: Called when the 'Resend OTP' TouchableOpacity is pressed.
  const handleResend = useCallback(async () => {
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      setInlineError('Please enter your email address.');
      return;
    }

    setInlineError(null);
    setIsResending(true);

    try {
      // Calls the resendOTP function from AuthContext.
      const result = await resendOTP({ email: trimmedEmail });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to resend OTP.');
        return;
      }

      // Start countdown
      setResendCountdown(60); // Sets the countdown duration.
      setCanResend(false); // Disables the resend button.
    } finally {
      setIsResending(false);
    }
  }, [form.email, resendOTP]);

  // useEffect: Manages the resend countdown timer.
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true); // Re-enables the resend button when countdown finishes.
    }
  }, [resendCountdown]);

  // bannerMessage: Determines which error message to display (inline or global auth error).
  const bannerMessage = inlineError || error;

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header section of the authentication page. */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Verify OTP</Text>
          <Text className="auth-subtitle">
            Enter the code sent to your email address.
          </Text>
        </View>

        {/* Form input fields and actions. */}
        <View className="auth-form w-full">
          {/* Email input field. */}
          <View className="auth-field">
            <Text className="label">Email</Text>
            <TextInput
              value={form.email}
              onChangeText={(value) => handleInputChange('email', value)} // Calls handleInputChange on text change.
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="user@example.com"
              className="input"
            />
          </View>

          {/* OTP input field. */}
          <View className="auth-field">
            <Text className="label">OTP Code</Text>
            <TextInput
              value={form.otp}
              onChangeText={(value) => handleInputChange('otp', value)} // Calls handleInputChange on text change, triggering auto-submit.
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              className="input text-center text-2xl font-semibold tracking-[0.5em]"
            />
          </View>

          {/* Resend OTP button. onPress calls handleResend. */}
          <TouchableOpacity
            onPress={handleResend}
            disabled={!canResend} // Disabled state controlled by canResend.
            className={`${!canResend ? 'opacity-50' : ''}`}>
            <Text className="auth-link">
              {canResend ? 'Resend OTP' : `Resend OTP (${resendCountdown}s)`}
            </Text>
          </TouchableOpacity>

          {/* Error banner displays bannerMessage if present. */}
          {bannerMessage ? (
            <Text className="auth-inline-message-error">{bannerMessage}</Text>
          ) : null}

          {/* Submit button. onPress calls handleSubmit. */}
          <TouchableOpacity
            onPress={() => handleSubmit()}
            disabled={!canSubmit} // Disabled state controlled by canSubmit.
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
            {isSubmitting || isLoading ? 'Verifying...' : 'Verify'}
          </TouchableOpacity>
        </View>

        {/* Link back to the login page. */}
        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Back to <Text className="font-semibold text-brand-primary">sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
