import { useCallback, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteToken } from '../../../storage/tokenStore';

export default function LoginScreen() {
  const router = useRouter();
  // useAuth provides login function, loading state, global errors, and error clearing.
  const { login, isLoading, error, clearError } = useAuth();

  // State to manage form inputs (email, password), remember me option, password visibility, and submission status.
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for displaying inline error messages specific to this form.
  const [inlineError, setInlineError] = useState<string | null>(null);

  // handleInputChange: Updates form state when TextInput components' values change.
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      setForm((previous) => ({ ...previous, [name]: value }));
      if (error) {
        clearError(); // Clears global auth errors.
      }
      setInlineError(null); // Clears local inline errors.
    },
    [error, clearError],
  );

  // canSubmit: Memoized value indicating if the form can be submitted.
  // This controls the 'disabled' prop of the submit TouchableOpacity.
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.password) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.password, isSubmitting, isLoading],
  );

  // handleSubmit: Called when the 'Sign in' TouchableOpacity is pressed.
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
      // Calls the login function from AuthContext to authenticate the user.
      const result = await login({ email: trimmedEmail, password: form.password });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to sign in.');
        return;
      }

      // If remember me is unchecked, drop the refresh token from storage.
      if (!rememberMe) {
        await deleteToken('refreshToken');
      }

      // Redirect to the authenticated home page using expo-router.
      router.replace('/');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form, rememberMe, login, router]);

  // bannerMessage: Determines which error message to display (inline or global auth error).
  const bannerMessage = inlineError || error;

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header section of the authentication page. */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Welcome back</Text>
          <Text className="auth-subtitle">
            Sign in to manage your appointments and bookings.
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

          {/* Password input field with visibility toggle. */}
          <View className="auth-field">
            <Text className="label">Password</Text>
            <View className="relative">
              <TextInput
                value={form.password}
                onChangeText={(value) => handleInputChange('password', value)} // Calls handleInputChange on text change.
                autoComplete="password"
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

          {/* "Remember me" checkbox and "Forgot password?" link. */}
          <View className="auth-actions">
            <TouchableOpacity
              onPress={() => {
                setRememberMe((previous) => !previous); // Toggles rememberMe state.
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
            {/* Navigates to forgot password screen using expo-router Link. */}
            <Link href="/(public)/(auth)/forgot-password">
              <Text className="auth-link">Forgot password?</Text>
            </Link>
          </View>

          {/* Error banner displays bannerMessage if present. */}
          {bannerMessage ? (
            <Text className="auth-inline-message-error">{bannerMessage}</Text>
          ) : null}

          {/* Submit button. onPress calls handleSubmit. */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit} // Disabled state controlled by canSubmit.
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}
            >
              {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
          </TouchableOpacity>

          {/* Link to the registration page. */}
          <Link href="/(public)/(auth)/register" className="auth-footer">
            <Text className="text-center text-sm text-gray-500">
              Don&apos;t have an account? <Text className="auth-link">Sign up</Text>
            </Text>
          </Link>
        </View>

      </View>
    </ScrollView>
  );
}
