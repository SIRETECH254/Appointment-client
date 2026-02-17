# Reset Password Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Params and State Management](#params-and-state-management)
- [UI Structure](#ui-structure)
- [Form Inputs](#form-inputs)
- [Validation Rules](#validation-rules)
- [Sketch Wireframe](#sketch-wireframe)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Feedback & Loading States](#feedback--loading-states)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '../../../contexts/AuthContext';
```

## Params and State Management
- **Dynamic route:** `/(public)/(auth)/reset-password/[token]`, token arrives via `useLocalSearchParams`.
- **Auth hook:** `useAuth().resetPassword` handles API submission.
- **Local state:**
  - `form` object (`{ password, confirmPassword }`) — controlled inputs.
  - `inlineMessage` (`{ type: 'success' | 'error'; text: string } | null`) — success/error feedback banner.
  - `isSubmitting` (`boolean`) — gate multiple submissions.
  - `isPasswordVisible`, `isConfirmPasswordVisible` — show/hide toggles.
  - `redirectTimer` (`useRef<ReturnType<typeof setTimeout> | null>`) — manages delayed redirect.
- **Derived helpers:** `canSubmit` memoizes disabled state; error banner merges inline + auth error.

## UI Structure
- **Screen shell:** full-height `View` with white background and centered content.
- **Layout:** open layout (no card) with stacked inputs and CTA.
- **Feedback:** inline success/error banner rendered within the form.
- **Branding:** heading + subtitle consistent with login/forgot screens.

## Form Inputs
- **Password field** (includes show/hide toggle)
  ```tsx
  <View className="relative">
    <TextInput
      value={form.password}
      onChangeText={(value) => handleInputChange('password', value)}
      autoComplete="new-password"
      secureTextEntry={!isPasswordVisible}
      placeholder="••••••••"
      className="input-password"
    />
    <TouchableOpacity
      onPress={() => setIsPasswordVisible((prev) => !prev)}
      className="input-toggle-icon">
      <MaterialIcons
        name={isPasswordVisible ? 'visibility-off' : 'visibility'}
        size={20}
        color="#6B7280"
      />
    </TouchableOpacity>
  </View>
  ```

- **Confirm password field** (not sent to API; includes show/hide toggle)
  ```tsx
  <View className="relative">
    <TextInput
      value={form.confirmPassword}
      onChangeText={(value) => handleInputChange('confirmPassword', value)}
      autoComplete="new-password"
      secureTextEntry={!isConfirmPasswordVisible}
      placeholder="••••••••"
      className="input-password"
    />
    <TouchableOpacity
      onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
      className="input-toggle-icon">
      <MaterialIcons
        name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
        size={20}
        color="#6B7280"
      />
    </TouchableOpacity>
  </View>
  ```

## Validation Rules
1. Token must exist (guarded before submission; show inline error if missing).
2. Password fields required.
3. `password === confirmPassword`; mismatch yields inline error.
4. While busy (`isSubmitting`) disable button to prevent double submits.

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                  │
│                                               │
│  Appointment Client                            │
│  Reset password                               │
│  Set a new password...                        │
│                                               │
│  New password     [____________________] (👁) │
│  Confirm password [____________________] (👁) │
│                                               │
│       [ Update password (gold) ]              │
│                                               │
│  Inline success / error message               │
│                                               │
│  Back to sign in                              │
└───────────────────────────────────────────────┘
```

## API Integration
- **HTTP client:** `useAuth().resetPassword(token, password)` calls `authAPI.resetPassword` (axios).
- **Endpoint:** `POST /api/auth/reset-password/:token`.
- **Payload:** `{ newPassword }` only — confirm field omitted intentionally.
- **Success path:** shows a green success banner and redirects back to `/(public)/(auth)/login` after a short delay.
- **Error handling:** displays API message or fallback inline message.

## Components Used
- React Native: `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`.
- Expo Router: `useLocalSearchParams`, `useRouter`, `Link`.
- `@expo/vector-icons/MaterialIcons` for password visibility toggles.
- NativeWind/Tailwind via `className`, plus shared component classes from `global.css` (white background + gold buttons).

## Feedback & Loading States
- Inline banner uses NativeWind/Tailwind classes to swap colors:
  - Success → green background, green text.
  - Error → red background, red text.
- Submit button shows loading text when busy.
- Success message triggers timed navigation to login (`setTimeout`).

## Navigation Flow
- Route path: `/(public)/(auth)/reset-password/[token]`.
- Guards missing/invalid token by showing error and disabling submit handling.
- On success: navigate to `/(public)/(auth)/login` with `replace`.
- Secondary link: footer CTA back to login.

## Functions Involved
- **`handleInputChange`** — clears banners and Redux auth errors when inputs change.
  ```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);
  ```

- **`handleSubmit`** — orchestrates validation and API call.
  ```tsx
  const handleSubmit = useCallback(async () => {
    if (!token) {
      setInlineMessage({ type: 'error', text: 'Reset link is missing or invalid.' });
      return;
    }

    if (!form.password || !form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Enter and confirm your new password.' });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
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
        text: 'Password updated! Redirecting to sign in...',
      });

      redirectTimer.current = setTimeout(() => {
        router.replace('/(public)/(auth)/login');
      }, 1500);
    } catch {
      setInlineMessage({ type: 'error', text: 'Unexpected error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, form.password, form.confirmPassword, resetPassword, router]);
  ```

- **Cleanup effect** — clears timer on unmount.
  ```tsx
  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);
  ```

## Future Enhancements
- Integrate password strength indicator and requirements checklist.
- Display countdown auto-redirect visibly instead of implicit timeout.
- Allow optional password paste detection or confirmation prompt.
- Add token expiration validation before form submission.
