import { useCallback, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  // Single form object to send as the register payload.
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
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
      Boolean(
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.email.trim() &&
        form.password &&
        form.confirmPassword &&
        form.password === form.confirmPassword,
      ) &&
      !isSubmitting &&
      !isLoading,
    [form, isSubmitting, isLoading],
  );

  // Form submission handler (validates + calls register).
  const handleSubmit = useCallback(async () => {
    const trimmedEmail = form.email.trim();
    if (!form.firstName || !form.lastName || !trimmedEmail || !form.password || !form.confirmPassword) {
      setInlineError('Please fill in all required fields.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setInlineError('Passwords do not match.');
      return;
    }

    // Clear old errors and start the button loader.
    setInlineError(null);
    setIsSubmitting(true);

    try {
      // Send the form object as the register payload.
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: trimmedEmail,
        phone: form.phone || undefined,
        password: form.password,
      });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to register.');
        return;
      }

      // Navigate to OTP verification screen.
      router.push('/(public)/(auth)/verify-otp');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form, register, router]);

  // Prefer inline error over global auth error for display.
  const bannerMessage = inlineError || error;

  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Create account</Text>
          <Text className="auth-subtitle">
            Sign up to get started with appointment bookings.
          </Text>
        </View>

        {/* Form */}
        <View className="auth-form w-full">
          {/* First Name field */}
          <View className="auth-field">
            <Text className="label">First Name</Text>
            <TextInput
              value={form.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              autoCapitalize="words"
              placeholder="Enter your first name"
              className="input"
            />
          </View>

          {/* Last Name field */}
          <View className="auth-field">
            <Text className="label">Last Name</Text>
            <TextInput
              value={form.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              autoCapitalize="words"
              placeholder="Enter your last name"
              className="input"
            />
          </View>

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

          {/* Phone field (optional) */}
          <View className="auth-field">
            <Text className="label">Phone (Optional)</Text>
            <TextInput
              value={form.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="Enter your phone number"
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
                autoComplete="password-new"
                secureTextEntry={!isPasswordVisible}
                placeholder="••••••••"
                className="input-password"
              />
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

          {/* Confirm Password field */}
          <View className="auth-field">
            <Text className="label">Confirm Password</Text>
            <View className="relative">
              <TextInput
                value={form.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                autoComplete="password-new"
                secureTextEntry={!isConfirmPasswordVisible}
                placeholder="Confirm your password"
                className="input-password"
              />
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

          {/* Error banner */}
          {bannerMessage ? (
            <Text className="auth-inline-message-error">{bannerMessage}</Text>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </TouchableOpacity>
        </View>

        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Already have an account? <Text className="font-semibold text-brand-primary">Sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
