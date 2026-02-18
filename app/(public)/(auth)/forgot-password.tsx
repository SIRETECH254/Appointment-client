import { useCallback, useMemo, useState } from 'react';
import { Link } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function ForgotPasswordScreen() {
  // useAuth provides forgotPassword function, global error state, and error clearing.
  const { forgotPassword, error, clearError } = useAuth();
  // State for form input (email), inline messages, and submission status.
  const [form, setForm] = useState({ email: '' });
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handleInputChange: Updates form state when TextInput component's value changes.
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
    () => Boolean(form.email.trim()) && !isSubmitting,
    [form.email, isSubmitting],
  );

  // handleSubmit: Called when the 'Send reset link' TouchableOpacity is pressed.
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
      // Calls the forgotPassword function from AuthContext to request a reset link.
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
        {/* Header section of the authentication page. */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Forgot password?</Text>
          <Text className="auth-subtitle">
            Enter your email address and we will send reset instructions.
          </Text>
        </View>

        {/* Form input field and actions. */}
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
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </TouchableOpacity>
        </View>

        {/* Link back to the login page. */}
        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Remembered your password? <Text className="font-semibold text-brand-primary">Back to sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
