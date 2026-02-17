# Login Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` stores `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `Expo SecureStore` stores `accessToken` and `refreshToken`; `AsyncStorage` stores serialized user data.
- **Hook usage on login screen:** `const { login, isLoading, error, clearError } = useAuth();`
- **Form state:** single `form` object `{ email, password }` managed with `useState`.

**`login` function (from `AuthContext.tsx`):**
```tsx
const login = async (credentials: LoginPayload): Promise<AuthResult> => {
  dispatch(loginStart());
  dispatch(setAuthLoading(true));

  try {
    const response = await authAPI.login(credentials);
    const { user: userData, accessToken, refreshToken } = response.data.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));

    dispatch(
      loginSuccess({
        user: userData,
        accessToken,
        refreshToken,
      }),
    );

    return { success: true };
  } catch (loginError: any) {
    const errorMessage =
      loginError?.response?.data?.message || loginError?.message || 'Login failed';
    dispatch(loginFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};
```

**`isLoading` selector reused via `useAuth`:**
```tsx
const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
```

## UI Structure
- **Screen shell:** full-height `View` with a white background and centered content.
- **Typography:** React Native `Text` components styled with **NativeWind/Tailwind** via `className` and shared classes from `global.css`.
- **Layout helpers:** open layout (no card) with a max-width container using flexbox.
- **Branding:** header text block (title + subtitle).
- **Feedback:** inline error banner shown below inputs.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│   "Welcome back" (H1 style)   │
├───────────────────────────────┤
│           Subtitle            │
│   ("Sign in to manage...")    │
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│       Password Input          │
├───────────────────────────────┤
│ [ ] Remember me    Forgot?    │
├───────────────────────────────┤
│        Primary Button         │
├───────────────────────────────┤
│  Inline error / status text   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                  │
│                                               │
│  Appointment Client                            │
│  Welcome back                                 │
│  Sign in to manage appointments...            │
│                                               │
│  Email  [______________________________]      │
│  Password [__________________________] (👁)   │
│                                               │
│  [ ] Remember me            Forgot password?  │
│                                               │
│        [  Sign in (gold)  ]                   │
│                                               │
│  Inline error text (if any)                   │
│                                               │
│  Need access? Contact your administrator.     │
└───────────────────────────────────────────────┘
```

## Form Inputs
- **Email field**
  ```tsx
  <TextInput
    value={form.email}
    onChangeText={(value) => handleInputChange('email', value)}
    autoCapitalize="none"
    autoComplete="email"
    keyboardType="email-address"
    placeholder="user@example.com"
    className="input"
  />
  ```

- **Password field** (show/hide toggle)
  ```tsx
  <View className="relative">
    <TextInput
      value={form.password}
      onChangeText={(value) => handleInputChange('password', value)}
      autoComplete="password"
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

- **Remember me toggle**
  ```tsx
  <TouchableOpacity
    onPress={() => {
      setRememberMe((previous) => !previous);
      setInlineError(null);
    }}
    className="auth-remember">
    <View className={`h-4 w-4 items-center justify-center rounded border-2 border-brand-primary ${rememberMe ? 'bg-brand-tint' : 'bg-white'}`}>
      {rememberMe && <MaterialIcons name="check" size={16} color="#D4AF37" />}
    </View>
    <Text className="font-inter text-sm text-slate-600">Remember me</Text>
  </TouchableOpacity>
  ```

- **Submit button**
  ```tsx
  <TouchableOpacity
    onPress={handleSubmit}
    disabled={!canSubmit}
    className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
    <Text className="font-inter text-sm font-semibold text-white">
      {isSubmitting || isLoading ? 'Signing in...' : 'Sign in'}
    </Text>
  </TouchableOpacity>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `authAPI.login`.
- **Endpoint:** `POST /api/auth/login`.
- **Payload:** `{ email: string; password: string }`.
- **Response contract:** `data.data` contains `{ user, accessToken, refreshToken }`.
- **Token handling:** tokens saved to `Expo SecureStore`; user data to `AsyncStorage`; Redux receives `loginSuccess`.
- **Error responses:** API returns a message in `response.data.message`; fallback to generic message.

## Components Used
- React Native: `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`.
- Expo Router: `useRouter`, `Link`.
- `@expo/vector-icons/MaterialIcons` for password visibility icons.
- NativeWind/Tailwind via `className`, plus shared component classes from `global.css` (white background + gold buttons).

## Error Handling
- `useAuth` dispatches `loginFailure` and `setAuthFailure`, populating Redux `error`.
- Login screen shows a banner for `inlineError` or Redux `error`.
- Client-side checks ensure inputs are not empty before submission.
- `handleInputChange` clears stale errors as soon as the user edits inputs.
- Input values persist in local state after failures to avoid retyping.

## Navigation Flow
- Route: `/(public)/(auth)/login`.
- On app launch, `/(public)/` is accessible to all; authenticated users can access `/(authenticated)/(tabs)/profile`.
- Successful login ➞ `router.replace('/(authenticated)/(tabs)/profile')`.
- Secondary navigation:
  - "Forgot password?" ➞ `/(public)/(auth)/forgot-password`.
  - "Back to sign in" link on other pages ➞ `/(public)/(auth)/login`.

## Functions Involved
- **`handleSubmit`** — orchestrates local validation, calls `login`, handles navigation, and clears the refresh token when "remember me" is unchecked.
  ```tsx
  const handleSubmit = useCallback(async () => {
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail || !form.password) {
      setInlineError('Please enter both email and password.');
      return;
    }

    setInlineError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email: trimmedEmail, password: form.password });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to sign in.');
        return;
      }

      if (!rememberMe) {
        await SecureStore.deleteItemAsync('refreshToken');
      }

      router.replace('/(authenticated)/(tabs)/profile');
    } finally {
      setIsSubmitting(false);
    }
  }, [form.email, form.password, rememberMe, login, router]);
  ```

- **`handleInputChange`** — clears Redux and inline errors whenever the user adjusts a field.
  ```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    if (error) {
      clearError();
    }
    setInlineError(null);
  }, [error, clearError]);
  ```

## Future Enhancements
- Add optional form libraries (`react-hook-form`) when advanced validation is required.
- Introduce branded logo assets once design system finalizes.
- Provide account recovery hints for locked or disabled accounts.
- Add rate-limit feedback when the API returns those states.
- Implement biometric authentication for mobile devices.
- Add social login options (Google, Apple) if backend supports.
