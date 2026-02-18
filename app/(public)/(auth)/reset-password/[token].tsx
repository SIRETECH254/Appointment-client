import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../../../contexts/AuthContext';

type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function ResetPasswordScreen() {
  // useLocalSearchParams to get the reset token from the URL.
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  // useAuth provides resetPassword function, global error state, and error clearing.
  const { resetPassword, error, clearError } = useAuth();

  // State for form inputs (password, confirmPassword), password visibility, and submission status.
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  // State for displaying inline error/success messages.
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ref for managing the redirect timer.
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // useEffect: Cleans up the delayed redirect timer on component unmount.
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  // handleInputChange: Updates form state when TextInput components' values change.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update form and clear any errors.
      setForm((previous) => ({ ...previous, [name]: value }));
      if (error) {
        clearError(); // Clears global auth errors.
      }
      setInlineMessage(null); // Clears local inline messages.
    },
    [error, clearError],
  );

  // canSubmit: Memoized value indicating if the form can be submitted.
  // This controls the 'disabled' prop of the submit TouchableOpacity.
  const canSubmit = useMemo(
    () =>
      Boolean(token && form.password && form.confirmPassword) &&
      !isSubmitting &&
      form.password === form.confirmPassword,
    [token, form.password, form.confirmPassword, isSubmitting],
  );

  // handleSubmit: Called when the 'Update password' TouchableOpacity is pressed.
  const handleSubmit = useCallback(async () => {
    // Ensure token is present in the URL.
    if (!token) {
      setInlineMessage({
        type: 'error',
        text: 'Reset link is missing or invalid.',
      });
      return;
    }

    // Require both password fields.
    if (!form.password || !form.confirmPassword) {
      setInlineMessage({
        type: 'error',
        text: 'Enter and confirm your new password.',
      });
      return;
    }

    // Block submission if passwords do not match.
    if (form.password !== form.confirmPassword) {
      setInlineMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      return;
    }

    // Clear old messages and start the loader.
    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      // Calls the resetPassword function from AuthContext to update the password.
      const result = await resetPassword(token, form.password);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to reset password.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Password updated! Redirecting to sign in…',
      });

      // Delay navigation to let the user read the success message.
      redirectTimer.current = setTimeout(() => {
        router.replace('/(public)/(auth)/login'); // Navigates to the login page.
      }, 1500);
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [token, form.password, form.confirmPassword, resetPassword, router]);

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header section of the authentication page. */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Reset password</Text>
          <Text className="auth-subtitle">
            Set a new password for your account.
          </Text>
        </View>

        {/* Form input fields and actions. */}
        <View className="auth-form w-full">
          {/* New password input field with visibility toggle. */}
          <View className="auth-field">
            <Text className="label">New password</Text>
            <View className="relative">
              <TextInput
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)} // Calls handleInputChange on text change.
                autoComplete="new-password"
                secureTextEntry={!isPasswordVisible} // Toggled by setIsPasswordVisible.
                placeholder="••••••••"
                className="input-password"
              />
              {/* Toggle password visibility. onPress calls setIsPasswordVisible. */}
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((previous) => !previous)}
                className="input-toggle-icon"
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}>
                <MaterialIcons
                  name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm password input field with visibility toggle. */}
          <View className="auth-field">
            <Text className="label">Confirm password</Text>
            <View className="relative">
              <TextInput
                value={form.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)} // Calls handleInputChange on text change.
                autoComplete="new-password"
                secureTextEntry={!isConfirmPasswordVisible} // Toggled by setIsConfirmPasswordVisible.
                placeholder="••••••••"
                className="input-password"
              />
              {/* Toggle confirm password visibility. onPress calls setIsConfirmPasswordVisible. */}
              <TouchableOpacity
                onPress={() => setIsConfirmPasswordVisible((previous) => !previous)}
                className="input-toggle-icon"
                accessibilityLabel={isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}>
                <MaterialIcons
                  name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Inline feedback displays inlineMessage if present. */}
          {inlineMessage ? (
            <Text
              className={
                inlineMessage.type === 'success'
                  ? 'auth-inline-message-success'
                  : 'auth-inline-message-error'
              }>
              {inlineMessage.text}
            </Text>
          ) : null}

          {/* Submit button. onPress calls handleSubmit. */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit} // Disabled state controlled by canSubmit.
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
            {isSubmitting ? 'Updating...' : 'Update password'}
          </TouchableOpacity>
        </View>

        {/* Link back to the login page. */}
        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Need to try again? <Text className="font-semibold text-brand-primary">Back to sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
