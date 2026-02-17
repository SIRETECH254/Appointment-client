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
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const { resetPassword, error, clearError } = useAuth();

  // Single form object to drive the payload and validations.
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the delayed redirect on unmount.
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update form and clear any errors.
      setForm((previous) => ({ ...previous, [name]: value }));
      if (error) {
        clearError();
      }
      setInlineMessage(null);
    },
    [error, clearError],
  );

  // Derived flag for button disabled state and validation.
  const canSubmit = useMemo(
    () =>
      Boolean(token && form.password && form.confirmPassword) &&
      !isSubmitting &&
      form.password === form.confirmPassword,
    [token, form.password, form.confirmPassword, isSubmitting],
  );

  // Submit handler: validate token + password fields then call resetPassword.
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
      // Send the form-derived password as the payload source.
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
        router.replace('/(public)/(auth)/login');
      }, 1500);
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, form.password, form.confirmPassword, resetPassword, router]);

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Reset password</Text>
          <Text className="auth-subtitle">
            Set a new password for your account.
          </Text>
        </View>

        {/* Form */}
        <View className="auth-form w-full">
          {/* New password field */}
          <View className="auth-field">
            <Text className="label">New password</Text>
            <View className="relative">
              <TextInput
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)}
                autoComplete="new-password"
                secureTextEntry={!isPasswordVisible}
                placeholder="••••••••"
                className="input-password"
              />
              {/* Toggle password visibility */}
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

          {/* Confirm password field */}
          <View className="auth-field">
            <Text className="label">Confirm password</Text>
            <View className="relative">
              <TextInput
                value={form.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                autoComplete="new-password"
                secureTextEntry={!isConfirmPasswordVisible}
                placeholder="••••••••"
                className="input-password"
              />
              {/* Toggle confirm password visibility */}
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

          {/* Inline feedback */}
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

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
            {isSubmitting ? 'Updating...' : 'Update password'}
          </TouchableOpacity>
        </View>

        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Need to try again? <Text className="font-semibold text-brand-primary">Back to sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
