import { useCallback, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  // useAuth provides register function, loading state, global errors, and error clearing.
  const { register, isLoading, error, clearError } = useAuth();

  // State to manage form inputs (firstName, lastName, email, phone, password, confirmPassword).
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  // States for toggling password visibility for both password fields.
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  // State for managing submission status and local inline errors.
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // handleSubmit: Called when the 'Register' TouchableOpacity is pressed.
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
      // Calls the register function from AuthContext to register the user.
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

      // Navigate to OTP verification screen upon successful registration.
      router.push('/(public)/(auth)/verify-otp');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form, register, router]);

  // bannerMessage: Determines which error message to display (inline or global auth error).
  return (
    <ScrollView className="bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header section of the authentication page. */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Create account</Text>
          <Text className="auth-subtitle">
            Sign up to get started with appointment bookings.
          </Text>
        </View>

        {/* Form input fields and actions. */}
        <View className="auth-form w-full">
          {/* First Name input field. */}
          <View className="auth-field">
            <Text className="label">First Name</Text>
            <TextInput
              value={form.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)} // Calls handleInputChange on text change.
              autoCapitalize="words"
              placeholder="Enter your first name"
              className="input"
            />
          </View>

          {/* Last Name input field. */}
          <View className="auth-field">
            <Text className="label">Last Name</Text>
            <TextInput
              value={form.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)} // Calls handleInputChange on text change.
              autoCapitalize="words"
              placeholder="Enter your last name"
              className="input"
            />
          </View>

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

          {/* Phone input field (optional). */}
          <View className="auth-field">
            <Text className="label">Phone (Optional)</Text>
            <TextInput
              value={form.phone}
              onChangeText={(value) => handleInputChange('phone', value)} // Calls handleInputChange on text change.
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="Enter your phone number"
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
                autoComplete="password-new"
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

          {/* Confirm Password input field with visibility toggle. */}
          <View className="auth-field">
            <Text className="label">Confirm Password</Text>
            <View className="relative">
              <TextInput
                value={form.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)} // Calls handleInputChange on text change.
                autoComplete="password-new"
                secureTextEntry={!isConfirmPasswordVisible} // Toggled by setIsConfirmPasswordVisible.
                placeholder="Confirm your password"
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

          {/* Error banner displays bannerMessage if present. */}
          {bannerMessage ? (
            <Text className="auth-inline-message-error">{bannerMessage}</Text>
          ) : null}

          {/* Submit button. onPress calls handleSubmit. */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit} // Disabled state controlled by canSubmit.
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </TouchableOpacity>
        </View>

        {/* Link to the login page. */}
        <Link href="/(public)/(auth)/login" className="auth-footer-link">
          <Text className="text-center text-sm text-gray-500">
            Already have an account? <Text className="font-semibold text-brand-primary">Sign in</Text>
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
