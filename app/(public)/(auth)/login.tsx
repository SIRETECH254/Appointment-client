import { useCallback, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteToken } from '../../../storage/tokenStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  // Single form object to send as the login payload.
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Shared input handler for all fields.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      setForm((previous) => ({ ...previous, [name]: value }));
      if (error) {
        clearError();
      }
      setInlineError(null);
    },
    [error, clearError],
  );

  // Derived flag for button state and validation.
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.password) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.password, isSubmitting, isLoading],
  );

  // Form submission handler (validates + calls login).
  const handleSubmit = useCallback(async () => {
    // Trim email before sending to the API.
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail || !form.password) {
      setInlineError('Please enter both email and password.');
      return;
    }

    // Clear old errors and start the button loader.
    setInlineError(null);
    setIsSubmitting(true);

    try {
      // Send the form object as the login payload.
      const result = await login({ email: trimmedEmail, password: form.password });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to sign in.');
        return;
      }

      // If remember me is unchecked, drop the refresh token.
      if (!rememberMe) {
        await deleteToken('refreshToken');
      }

      // Redirect to the authenticated landing page.
      router.replace('/(authenticated)/(tabs)/profile');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form, rememberMe, login, router]);

  // Prefer inline error over global auth error for display.
  const bannerMessage = inlineError || error;

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Welcome back</Text>
          <Text className="auth-subtitle">
            Sign in to manage your appointments and bookings.
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

          {/* Password field */}
          <View className="auth-field">
            <Text className="label">Password</Text>
            <View className="relative">
              <TextInput
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)}
                autoComplete="password"
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

          {/* Remember me + forgot password */}
          <View className="auth-actions">
            <TouchableOpacity
              onPress={() => {
                setRememberMe((previous) => !previous);
                setInlineError(null);
                if (error) {
                  clearError();
                }
              }}
              className="auth-remember">
              <View className={`h-4 w-4 items-center justify-center rounded border-2 border-brand-primary ${rememberMe ? 'bg-brand-tint' : 'bg-white'}`}>
                {rememberMe && <MaterialIcons name="check" size={16} color="#D4AF37" />}
              </View>
              <Text className="font-inter text-sm text-slate-600">Remember me</Text>
            </TouchableOpacity>
            <Link href="/(public)/(auth)/forgot-password">
              <Text className="auth-link">Forgot password?</Text>
            </Link>
          </View>

          {/* Error banner */}
          {bannerMessage ? (
            <Text className="auth-inline-message-error">{bannerMessage}</Text>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
          </TouchableOpacity>

          <Link href="/(public)/(auth)/register" className="auth-footer">
            <Text className="text-center text-sm text-gray-500">
              Don't have an account? <Text className="auth-link">Sign up</Text>
            </Text>
          </Link>
        </View>

      </View>
    </ScrollView>
  );
}
