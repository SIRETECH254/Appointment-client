import { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { useChangePassword } from '@/tanstack/useUsers';

type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function ChangePasswordScreen() {
  const router = useRouter();
  // useQueryClient to access and invalidate TanStack Query caches.
  const queryClient = useQueryClient();
  // useChangePassword handles the mutation for changing the user's password.
  const changePasswordMutation = useChangePassword();

  // State to manage form inputs (currentPassword, newPassword, confirmPassword).
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  // States for toggling password visibility for all password fields.
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  // State for displaying inline success/error messages.
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  // handleInputChange: Updates form state when TextInput components' values change.
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null); // Clear messages on input change.
  }, []);

  // canSubmit: Memoized value indicating if the form can be submitted.
  // This controls the 'disabled' prop of the 'Update password' TouchableOpacity.
  const canSubmit = useMemo(() => {
    return (
      form.currentPassword.length > 0 &&
      form.newPassword.length > 0 &&
      form.confirmPassword.length > 0 &&
      form.newPassword === form.confirmPassword &&
      !changePasswordMutation.isPending
    );
  }, [form, changePasswordMutation.isPending]);

  // handleSubmit: Called when the 'Update password' TouchableOpacity is pressed.
  const handleSubmit = useCallback(async () => {
    setInlineMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      // Calls the useChangePassword mutation to update the password.
      await changePasswordMutation.mutateAsync({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setInlineMessage({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form on success.
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidate 'profile' query to ensure up-to-date data if needed.
    } catch (err: any) {
      setInlineMessage({ type: 'error', text: err.message || 'Failed to change password.' }); // Displays specific API error or generic fallback.
    }
  }, [form, changePasswordMutation, queryClient]);

  // bannerMessage: Determines which error/success message to display.
  const bannerMessage = inlineMessage || (changePasswordMutation.error ? { type: 'error', text: changePasswordMutation.error.message } : null);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow">
      {/* Main container for the change password screen, uses auth-container utility. */}
      <View className="auth-container">
        {/* Header section of the authentication page. */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Change password</Text>
          <Text className="auth-subtitle">
            Update your password to keep your account secure.
          </Text>
        </View>

        {/* Form input fields and actions. */}
        <View className="auth-form w-full">
          {/* Current password input field with visibility toggle. */}
          <View className="auth-field">
            <Text className="label">Current password</Text>
            <View className="relative">
              <TextInput
                value={form.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)} // Calls handleInputChange on text change.
                secureTextEntry={!isCurrentVisible} // Toggled by setIsCurrentVisible.
                placeholder="••••••••"
                className="input-password"
                autoComplete="current-password"
              />
              {/* Toggle password visibility. onPress calls setIsCurrentVisible. */}
              <TouchableOpacity
                onPress={() => setIsCurrentVisible((prev) => !prev)}
                className="input-toggle-icon"
                accessibilityLabel={isCurrentVisible ? 'Hide password' : 'Show password'}
              >
                <MaterialIcons
                  name={isCurrentVisible ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New password input field with visibility toggle. */}
          <View className="auth-field">
            <Text className="label">New password</Text>
            <View className="relative">
              <TextInput
                value={form.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)} // Calls handleInputChange on text change.
                secureTextEntry={!isNewVisible} // Toggled by setIsNewVisible.
                placeholder="••••••••"
                className="input-password"
                autoComplete="new-password"
              />
              {/* Toggle password visibility. onPress calls setIsNewVisible. */}
              <TouchableOpacity
                onPress={() => setIsNewVisible((prev) => !prev)}
                className="input-toggle-icon"
                accessibilityLabel={isNewVisible ? 'Hide password' : 'Show password'}
              >
                <MaterialIcons
                  name={isNewVisible ? 'visibility-off' : 'visibility'}
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
                secureTextEntry={!isConfirmVisible} // Toggled by setIsConfirmVisible.
                placeholder="••••••••"
                className="input-password"
                autoComplete="new-password"
              />
              {/* Toggle confirm password visibility. onPress calls setIsConfirmVisible. */}
              <TouchableOpacity
                onPress={() => setIsConfirmVisible((prev) => !prev)}
                className="input-toggle-icon"
                accessibilityLabel={isConfirmVisible ? 'Hide password' : 'Show password'}
              >
                <MaterialIcons
                  name={isConfirmVisible ? 'visibility-off' : 'visibility'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error/success banner displays bannerMessage if present. */}
          {bannerMessage ? (
            <Text className={
              bannerMessage.type === 'success'
                ? 'auth-inline-message-success'
                : 'auth-inline-message-error'
            }>
              {bannerMessage.text}
            </Text>
          ) : null}

          {/* Submit button. onPress calls handleSubmit. */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit} // Disabled state controlled by canSubmit.
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}
          >
            {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}