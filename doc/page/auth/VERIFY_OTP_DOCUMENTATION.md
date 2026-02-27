# Verify OTP Screen Documentation

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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from 'expo-router';

import { useAuth } from '../../../contexts/AuthContext';
```

## Context and State Management
- **Context provider:** `AuthProvider` from `contexts/AuthContext.tsx` wraps the app and exposes the `useAuth` hook.
- **Redux slice:** `redux/slices/authSlice.ts` stores `user`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`, and `error`.
- **Persistent storage:** `Expo SecureStore` stores `accessToken` and `refreshToken`; `AsyncStorage` stores serialized user data after successful verification.
- **Hook usage on verify-otp screen:** `const { verifyOTP, resendOTP, isLoading, error, clearError } = useAuth();`
- **Form state:** single `form` object `{ email, otp }` managed with `useState`.
- **Resend state:** `resendCountdown` (`number`) — countdown timer for resend button; `canResend` (`boolean`) — derived flag.

**`verifyOTP` function (from `AuthContext.tsx`):**
```tsx
const verifyOTP = async (otpData: VerifyOTPPayload): Promise<AuthResult> => {
  dispatch(loginStart());

  try {
    const response = await authAPI.verifyOTP(otpData);
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
  } catch (otpError: any) {
    const errorMessage =
      otpError?.response?.data?.message || otpError?.message || 'OTP verification failed';
    dispatch(loginFailure(errorMessage));
    dispatch(setAuthFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};
```

**`resendOTP` function (from `AuthContext.tsx`):**
```tsx
const resendOTP = async (emailData: ResendOTPPayload): Promise<AuthResult> => {
  try {
    await authAPI.resendOTP(emailData);
    return { success: true };
  } catch (resendError: any) {
    const errorMessage =
      resendError?.response?.data?.message || resendError?.message || 'Failed to resend OTP';
    return { success: false, error: errorMessage };
  }
};
```

## UI Structure
- **Screen shell:** full-height `View` with a white background and centered content.
- **Typography:** React Native `Text` components styled with **NativeWind/Tailwind** via `className` and shared classes from `global.css`.
- **Layout helpers:** open layout (no card) with a max-width container using flexbox.
- **Branding:** header text block (title + subtitle).
- **Feedback:** inline error/success banner shown below inputs.

## Planned Layout
```
┌───────────────────────────────┐
│            Header             │
│    "Verify OTP"               │
├───────────────────────────────┤
│        Subtitle / Copy        │
│  ("Enter the code sent to...")│
├───────────────────────────────┤
│        Email Input            │
├───────────────────────────────┤
│        OTP Input (6 digits)   │
├───────────────────────────────┤
│   Resend OTP button (countdown│
├───────────────────────────────┤
│  Inline error / status text   │
├───────────────────────────────┤
│   Primary Verify Button       │
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
│  Verify OTP                                   │
│  Enter the code sent to your email...         │
│                                               │
│  Email  [______________________________]      │
│  OTP    [__][__][__][__][__][__]             │
│                                               │
│  Resend OTP (60s)                            │
│                                               │
│       [ Verify (gold) ]                       │
│                                               │
│  Inline error / success message               │
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

- **OTP field** (6-digit code input)
  ```tsx
  <TextInput
    value={form.otp}
    onChangeText={(value) => {
      // Only allow digits, max 6 characters
      const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
      handleInputChange('otp', digitsOnly);
      // Auto-submit when 6 digits entered
      if (digitsOnly.length === 6) {
        handleSubmit();
      }
    }}
    keyboardType="number-pad"
    maxLength={6}
    placeholder="000000"
    className="input text-center text-2xl font-semibold tracking-[0.5em]"
  />
  ```

- **Resend OTP button**
  ```tsx
  <TouchableOpacity
    onPress={handleResend}
    disabled={!canResend}
    className={`${!canResend ? 'opacity-50' : ''}`}>
    <Text className="auth-link">
      {canResend ? 'Resend OTP' : `Resend OTP (${resendCountdown}s)`}
    </Text>
  </TouchableOpacity>
  ```

- **Submit button**
  ```tsx
  <TouchableOpacity
    onPress={handleSubmit}
    disabled={!canSubmit}
    className={`auth-button ${!canSubmit ? 'opacity-50' : ''}`}>
    <Text className="font-inter text-sm font-semibold text-white">
      {isSubmitting || isLoading ? 'Verifying...' : 'Verify'}
    </Text>
  </TouchableOpacity>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `authAPI.verifyOTP` and `authAPI.resendOTP`.
- **Verify Endpoint:** `POST /api/auth/verify-otp` — Verify OTP and activate account.
- **Headers:** No authentication required (public endpoint).
- **Verify Payload:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Verify Response contract:** `response.data.data` contains `{ user, accessToken, refreshToken }` on successful verification.
- **Verify Response structure:**
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "data": {
      "user": {
        "_id": "...",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "user@example.com",
        "role": "customer"
      },
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
  ```
- **Resend Endpoint:** `POST /api/auth/resend-otp` — Resend OTP code.
- **Resend Payload:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Resend Response structure:**
  ```json
  {
    "success": true,
    "message": "OTP resent successfully"
  }
  ```
- **Token handling:** On successful verification, tokens are saved to `Expo SecureStore`; user data to `AsyncStorage`; Redux receives `loginSuccess` action.
- **Error responses:** API returns error message in `response.data.message`; fallback to generic message.

## Components Used
- React Native: `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`.
- Expo Router: `useRouter`, `Link`.
- NativeWind/Tailwind via `className`, plus shared component classes from `global.css` (white background + gold buttons).

## Error Handling
- `useAuth` dispatches `loginFailure` and `setAuthFailure`, populating Redux `error`.
- Verify OTP screen shows a banner for `inlineError` or Redux `error`.
- Client-side checks ensure email and OTP are not empty before submission.
- `handleInputChange` clears stale errors as soon as the user edits inputs.
- Resend OTP handles errors separately and shows inline messages.

## Navigation Flow
- Route: `/(public)/(auth)/verify-otp`.
- Entry points:
  - Registration screen after successful registration (`/(public)/(auth)/register`).
  - Direct navigation if user needs to verify account.
- Successful verification ➞ `router.replace('/(authenticated)/(tabs)/profile')`.
- Secondary navigation:
  - "Back to sign in" link ➞ `/(public)/(auth)/login`.

## Functions Involved

- **`handleInputChange`** — Clears Redux and inline errors whenever the user adjusts a field. Includes special logic for OTP input to auto-submit when 6 digits are entered.
  ```tsx
  const handleInputChange = useCallback(
    (name: keyof typeof form, value: string) => {
      // Update the form and clear any visible errors.
      if (name === 'otp') {
        // Only allow digits, max 6 characters
        const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 6);
        setForm((previous) => ({ ...previous, [name]: digitsOnly }));
        // Auto-submit when 6 digits entered
        if (digitsOnly.length === 6) {
          setTimeout(() => handleSubmit(digitsOnly), 100); // Auto-triggers handleSubmit.
        }
      } else {
        setForm((previous) => ({ ...previous, [name]: value }));
      }
      if (error) {
        clearError(); // Clears global auth errors.
      }
      setInlineError(null); // Clears local inline errors.
    },
    [error, clearError, handleSubmit],
  );
  ```

- **`handleSubmit`** — Validates email and OTP, calls `verifyOTP`, and handles navigation on success.
  ```tsx
  const handleSubmit = useCallback(async (otpValue?: string) => {
    const trimmedEmail = form.email.trim();
    const otpToVerify = otpValue || form.otp;

    if (!trimmedEmail || !otpToVerify || otpToVerify.length !== 6) {
      setInlineError('Please enter your email and a valid 6-digit OTP.');
      return;
    }

    // Clear old errors and start the button loader.
    setInlineError(null);
    setIsSubmitting(true);

    try {
      // Calls the verifyOTP function from AuthContext to verify the OTP.
      const result = await verifyOTP({ email: trimmedEmail, otp: otpToVerify });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to verify OTP.');
        return;
      }

      // Redirect to the authenticated profile page upon successful OTP verification.
      router.replace('/(authenticated)/(tabs)/profile');
    } finally {
      // Always stop the loader.
      setIsSubmitting(false);
    }
  }, [form.email, form.otp, verifyOTP, router]);
  ```

- **`handleResend`** — Validates email and calls `resendOTP` with countdown timer.
  ```tsx
  const handleResend = useCallback(async () => {
    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      setInlineError('Please enter your email address.');
      return;
    }

    setInlineError(null);

    try {
      // Calls the resendOTP function from AuthContext.
      const result = await resendOTP({ email: trimmedEmail });
      if (!result.success) {
        setInlineError(result.error ?? 'Unable to resend OTP.');
        return;
      }

      // Start countdown timer (60 seconds)
      setCanResend(false);
      setResendCountdown(60);
      
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setInlineError('Unexpected error. Please try again.');
    }
  }, [form.email, resendOTP]);
  ```

- **`canSubmit` (memoized)** — Determines if form can be submitted based on validation rules.
  ```tsx
  const canSubmit = useMemo(
    () =>
      Boolean(form.email.trim() && form.otp.length === 6) &&
      !isSubmitting &&
      !isLoading,
    [form.email, form.otp, isSubmitting, isLoading],
  );
  ```
      setResendCountdown(60);
      setCanResend(false);
    } finally {
      setIsResending(false);
    }
  }, [form.email, resendOTP]);
  ```

- **Countdown effect** — manages resend button countdown timer.
  ```tsx
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);
  ```

## Future Enhancements
- Add OTP input field with individual digit boxes for better UX.
- Add auto-focus between OTP input fields.
- Add paste detection for OTP codes from clipboard.
- Add SMS OTP option if backend supports phone verification.
- Add rate limiting feedback for too many resend attempts.
- Add visual feedback for successful OTP verification before navigation.
