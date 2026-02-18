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
  const queryClient = useQueryClient(); // Get queryClient instance
  const changePasswordMutation = useChangePassword();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null); // Clear messages on input change
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.currentPassword.length > 0 &&
      form.newPassword.length > 0 &&
      form.confirmPassword.length > 0 &&
      form.newPassword === form.confirmPassword &&
      !changePasswordMutation.isPending
    );
  }, [form, changePasswordMutation.isPending]);

  const handleSubmit = useCallback(async () => {
    setInlineMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setInlineMessage({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form on success
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidate profile query
    } catch (err: any) {
      setInlineMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  }, [form, changePasswordMutation, queryClient]);

  const bannerMessage = inlineMessage || (changePasswordMutation.error ? { type: 'error', text: changePasswordMutation.error.message } : null);

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="flex-grow">
      <View className="auth-container">
        {/* Header */}
        <View className="auth-header">
          <Text className="auth-kicker">Appointment Client</Text>
          <Text className="auth-title">Change password</Text>
          <Text className="auth-subtitle">
            Update your password to keep your account secure.
          </Text>
        </View>

        <View className="auth-form w-full">
          {/* Current password field */}
          <View className="auth-field">
            <Text className="label">Current password</Text>
            <View className="relative">
              <TextInput
                value={form.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                secureTextEntry={!isCurrentVisible}
                placeholder="••••••••"
                className="input-password"
                autoComplete="current-password"
              />
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

          {/* New password field */}
          <View className="auth-field">
            <Text className="label">New password</Text>
            <View className="relative">
              <TextInput
                value={form.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                secureTextEntry={!isNewVisible}
                placeholder="••••••••"
                className="input-password"
                autoComplete="new-password"
              />
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

          {/* Confirm password field */}
          <View className="auth-field">
            <Text className="label">Confirm password</Text>
            <View className="relative">
              <TextInput
                value={form.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!isConfirmVisible}
                placeholder="••••••••"
                className="input-password"
                autoComplete="new-password"
              />
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

          {bannerMessage ? (
            <Text className={
              bannerMessage.type === 'success'
                ? 'auth-inline-message-success'
                : 'auth-inline-message-error'
            }>
              {bannerMessage.text}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}
          >
            {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}