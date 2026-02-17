import { useCallback, useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function ForgotPasswordScreen() {
  const { forgotPassword, error, clearError } = useAuth();
  // Single form object to send as payload.
  const [form, setForm] = useState({ email: '' });
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Derived flag for button disabled state.
  const canSubmit = useMemo(
    () => Boolean(form.email.trim()) && !isSubmitting,
    [form.email, isSubmitting],
  );

  // Submit handler: validate email and call forgotPassword.
  const handleSubmit = useCallback(async () => {
    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) {
      setInlineMessage({
        type: 'error',
        text: 'Please enter your email address.',
      });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      // Send the form object as the payload source.
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to send reset link.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form.email, forgotPassword]);

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Forgot password?</Text>
          <Text className="auth-subtitle">
            Enter your email address and we will send reset instructions.
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
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </TouchableOpacity>
        </View>

        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Remembered your password? <Text className="font-semibold text-brand-primary">Back to sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
