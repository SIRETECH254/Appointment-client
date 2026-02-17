# Forgot Password Screen Documentation

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
import { Link } from 'expo-router';

import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the tree and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` retains `isLoading`, `error`, and auth metadata that the screen can surface.
- **Persistent storage:** `Expo SecureStore` and `AsyncStorage` keep tokens and the serialized user; not modified in this flow.
- **Hook usage on forgot-password screen:** `const { forgotPassword, error, clearError } = useAuth();`
- **Form state:** single `form` object `{ email }` managed with `useState`.

**`forgotPassword` function (from `AuthContext.tsx`):**
```tsx
const forgotPassword = async (email: string): Promise<AuthResult> => {
  try {
    await authAPI.forgotPassword({ email });
    return { success: true };
  } catch (forgotError: any) {
    const errorMessage =
      forgotError?.response?.data?.message || forgotError?.message || 'Failed to send reset email';
    return { success: false, error: errorMessage };
  }
};
```

## UI Structure
- **Screen shell:** full-height `View` with a white background and centered content.
- **Typography:** React Native `Text` components styled with **NativeWind/Tailwind** via `className` and shared classes from `global.css`.
- **Layout helpers:** open layout (no card) with a max-width container using flexbox.
- **Feedback:** inline success or error banners appear beneath the form to inform the user of API outcomes.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│    "Forgot password?"         │
├───────────────────────────────┤
│        Subtitle / Copy        │
│  ("Enter your email address") │
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│   Primary Submit Button       │
├───────────────────────────────┤
│  Inline success / error text  │
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
│  Forgot password?                             │
│  Enter your email address...                  │
│                                               │
│  Email  [______________________________]      │
│                                               │
│       [ Send reset link (gold) ]              │
│                                               │
│  Inline success / error message               │
│                                               │
│  Back to sign in                              │
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

## API Integration
- **HTTP client:** Uses the shared axios instance exported from `api/config.ts`.
- **Endpoint:** `POST /api/auth/forgot-password`.
- **Payload:** `{ email: string }`.
- **Response contract:** Success returns a confirmation message; error responses populate `response.data.message`.
- **Token handling:** No token exchange occurs; the backend sends reset instructions to the provided email.

## Components Used
- React Native: `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`.
- Expo Router: `Link`.
- NativeWind/Tailwind via `className`, plus shared component classes from `global.css` (white background + gold buttons).

## Error Handling
- `useAuth` surfaces API failures via the returned `AuthResult`.
- Client-side validation blocks submission when the email field is empty.
- `handleInputChange` clears stale errors once the user edits the field.
- Success responses render a green banner instructing the user to check their inbox.

## Navigation Flow
- Route: `/(public)/(auth)/forgot-password`.
- Entry points:
  - Login screen's "Forgot password?" link (`/(public)/(auth)/login`).
  - Any guarded flow that needs password assistance.
- On success, the user remains on the page with success messaging and can navigate back to `/(public)/(auth)/login`.
- Secondary navigation:
  - "Back to sign in" CTA ➞ `/(public)/(auth)/login`.

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

- **`handleSubmit`** — validates input, calls `forgotPassword`, and updates status messaging.
  ```tsx
  const handleSubmit = useCallback(async () => {
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      setInlineMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({ type: 'error', text: result.error ?? 'Unable to send reset link.' });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({ type: 'error', text: 'Unexpected error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [form.email, forgotPassword]);
  ```

## Future Enhancements
- Add resend and support links when rate-limiting or delivery failures occur.
- Capture analytics (form submits, error reasons) for product feedback.
- Localize copy and validation messaging as part of internationalization.
- Extend the flow to handle phone-based recovery once backend supports SMS resets.
- Add email validation feedback before submission.
