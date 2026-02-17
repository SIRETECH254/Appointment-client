# Register Screen Documentation

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

import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` retains `isLoading`, `error`, and auth metadata that the screen can surface.
- **Persistent storage:** `Expo SecureStore` and `AsyncStorage` are not modified during registration (no tokens yet).
- **Hook usage on register screen:** `const { register, error, clearError } = useAuth();`
- **Form state:** single `form` object `{ firstName, lastName, email, phone, password, confirmPassword }` managed with `useState`.

**`register` function (from `AuthContext.tsx`):**
```tsx
const register = async (userData: RegisterPayload): Promise<AuthResult> => {
  dispatch(registerStart());

  try {
    const response = await authAPI.register(userData);
    dispatch(registerSuccess());
    return { success: true, data: response.data.data };
  } catch (registerError: any) {
    const errorMessage =
      registerError?.response?.data?.message || registerError?.message || 'Registration failed';
    dispatch(registerFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};
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
│    "Create account"            │
├───────────────────────────────┤
│        Subtitle / Copy        │
│  ("Sign up to get started")   │
├───────────────────────────────┤
│      First Name Input         │
├───────────────────────────────┤
│      Last Name Input          │
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│      Phone Input (Optional)   │
├───────────────────────────────┤
│       Password Input          │
├───────────────────────────────┤
│   Confirm Password Input      │
├───────────────────────────────┤
│   Inline error / status text  │
├───────────────────────────────┤
│   Primary Submit Button       │
├───────────────────────────────┤
│   Back to login link/button   │
└───────────────────────────────┘
```

## Sketch Wireframe
```
┌───────────────────────────────────────────────┐
│            White background                   │
│                                               │
│  Appointment Client                            │
│  Create account                                │
│  Sign up to get started...                    │
│                                               │
│  First Name  [________________________]      │
│  Last Name   [________________________]      │
│  Email       [________________________]      │
│  Phone       [________________________]      │
│  Password    [________________________] (👁) │
│  Confirm     [________________________] (👁) │
│                                               │
│       [ Register (gold) ]                     │
│                                               │
│  Inline error / success message               │
│                                               │
│  Already have an account? Sign in            │
└───────────────────────────────────────────────┘
```

## Form Inputs
- **First Name field**
  ```tsx
  <TextInput
    value={form.firstName}
    onChangeText={(value) => handleInputChange('firstName', value)}
    autoCapitalize="words"
    placeholder="Enter your first name"
    className="input"
  />
  ```

- **Last Name field**
  ```tsx
  <TextInput
    value={form.lastName}
    onChangeText={(value) => handleInputChange('lastName', value)}
    autoCapitalize="words"
    placeholder="Enter your last name"
    className="input"
  />
  ```

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

- **Phone field** (optional)
  ```tsx
  <TextInput
    value={form.phone}
    onChangeText={(value) => handleInputChange('phone', value)}
    keyboardType="phone-pad"
    autoComplete="tel"
    placeholder="Enter your phone number"
    className="input"
  />
  ```

- **Password field** (show/hide toggle)
  ```tsx
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

- **Confirm Password field** (show/hide toggle)
  ```tsx
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

- **Submit button**
  ```tsx
  <TouchableOpacity
    onPress={handleSubmit}
    disabled={!canSubmit}
    className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
    <Text className="font-inter text-sm font-semibold text-white">
      {isSubmitting ? 'Registering...' : 'Register'}
    </Text>
  </TouchableOpacity>
  ```

## API Integration
- **HTTP client:** Uses the shared axios instance exported from `api/config.ts`.
- **Endpoint:** `POST /api/auth/register`.
- **Payload:** `{ firstName: string; lastName: string; email: string; phone?: string; password: string }`.
- **Response contract:** Success returns user data and triggers OTP email; error responses populate `response.data.message`.
- **Token handling:** No token exchange occurs; backend sends OTP verification email.

## Components Used
- React Native: `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`.
- Expo Router: `useRouter`, `Link`.
- `@expo/vector-icons/MaterialIcons` for password visibility icons.
- NativeWind/Tailwind via `className`, plus shared component classes from `global.css` (white background + gold buttons).

## Error Handling
- `useAuth` surfaces API failures via the returned `AuthResult`.
- Client-side validation blocks submission when required fields are empty or passwords don't match.
- `handleInputChange` clears stale errors once the user edits the field.
- Error responses render a red banner with the API message.

## Navigation Flow
- Route: `/(public)/(auth)/register`.
- Entry points:
  - Login screen's "Register" link (`/(public)/(auth)/login`).
  - Homepage "Register" button (`/(public)/`).
- On success, the user remains on the page with success messaging and navigates to `/(public)/(auth)/verify-otp`.
- Secondary navigation:
  - "Already have an account? Sign in" CTA ➞ `/(public)/(auth)/login`.

## Functions Involved
- **`handleInputChange`** — clears banners and Redux auth errors when inputs change.
  ```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    if (error) {
      clearError();
    }
    setInlineError(null);
  }, [error, clearError]);
  ```

- **`handleSubmit`** — validates input, calls `register`, and updates status messaging.
  ```tsx
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

    setInlineError(null);
    setIsSubmitting(true);

    try {
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

      // Navigate to OTP verification
      router.push('/(public)/(auth)/verify-otp');
    } catch {
      setInlineError('Unexpected error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, register, router]);
  ```

## Future Enhancements
- Add password strength indicator and requirements checklist.
- Add phone number validation and formatting.
- Capture analytics (form submits, error reasons) for product feedback.
- Localize copy and validation messaging as part of internationalization.
- Add terms and conditions checkbox before registration.
- Implement email/phone verification before account activation.
