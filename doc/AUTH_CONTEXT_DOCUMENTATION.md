# AuthContext Documentation

## Overview

This document provides comprehensive documentation for the AuthContext implementation in the Appointment Client React Native application. The AuthContext provides authentication functionality using Redux as the single source of truth (no useReducer), adapted for a React Native environment.

**Location:** `contexts/AuthContext.tsx`

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Storage Strategy](#storage-strategy)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Type Definitions](#type-definitions)

---

## Architecture Overview

The AuthContext provides a centralized authentication system that:

- Uses **Redux** as the single source of truth for all auth state
- Persists authentication state using **Expo SecureStore** (for tokens) and **AsyncStorage** (for user object)
- Integrates with **Expo Router** for navigation
- Provides authentication functions (login, register, OTP, password reset, etc.)
- Handles token refresh and validation automatically via API interceptors
- Manages user profile updates

### Component Structure

```
AuthProvider (Context Provider)
├── Redux Integration (useSelector, useDispatch)
├── Expo SecureStore / AsyncStorage Integration (token/user persistence)
├── Navigation Integration (Expo Router)
└── Auth Functions (login, register, logout, etc.)
```

---

## State Management

### Why Redux Only?

- **Single Source of Truth**: All auth state comes from Redux store
- **Consistency**: No conflicts between local and global state
- **Persistence**: Redux Persist handles state persistence automatically
- **Simplicity**: Fewer moving parts, easier to debug

### Redux State Structure

The auth state is managed entirely through Redux:

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Redux Actions Used

The AuthContext uses the following Redux actions from `src/redux/slices/authSlice.ts`:

- `loginStart()` - Sets loading state
- `loginSuccess({ user, accessToken, refreshToken })` - Sets authenticated state
- `loginFailure(error)` - Sets error state
- `registerStart()` - Sets loading for registration
- `registerSuccess()` - Clears loading after registration
- `registerFailure(error)` - Sets registration error
- `logout()` - Clears all auth state
- `updateUser(user)` - Updates user in state
- `setTokens({ accessToken, refreshToken? })` - Updates tokens
- `clearError()` - Clears error state
- `setLoading(boolean)` - Sets loading state
- `setAuthLoading(boolean)` - Sets loading and clears error
- `setAuthSuccess(user)` - Sets user and authenticated state
- `setAuthFailure(error | null)` - Sets error state
- `clearAuth()` - Clears all auth state and resets loading

### State Access

All state is accessed via `useSelector`:

```typescript
const user = useSelector((state: RootState) => state.auth.user);
const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
const isLoading = useSelector((state: RootState) => state.auth.isLoading);
const error = useSelector((state: RootState) => state.auth.error);
```

---

## Storage Strategy

### Storage Keys

The following storage keys are used:

- **Expo SecureStore**:
  - `accessToken` - JWT access token
  - `refreshToken` - JWT refresh token
- **AsyncStorage**:
  - `user` - Serialized user object (JSON string)

### Storage Flow

1. **On Login/Register**: Tokens are stored in SecureStore and user data in AsyncStorage.
2. **On App Start**: AuthContext rehydrates state from SecureStore and AsyncStorage.
3. **Background Validation**: User profile is refreshed in background without clearing tokens on failure.
4. **On Logout**: All tokens and user data are removed from SecureStore and AsyncStorage.

### Rehydration Strategy

```typescript
// 1. Rehydrate immediately from SecureStore and AsyncStorage
if (token && storedUser) {
  // Restore state from storage
  dispatch(setAuthSuccess(storedUser));
  dispatch(setTokens({ accessToken: token }));
}

// 2. Background validation (non-blocking)
// Refresh user profile without clearing tokens on failure
```

---

## API Reference

### AuthProvider Props

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

### Context Value

The AuthContext provides the following value:

```typescript
interface AuthContextValue {
  // State (from Redux)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Auth Functions
  login: (credentials: LoginPayload) => Promise<AuthResult>;
  register: (userData: RegisterPayload) => Promise<AuthResult>;
  verifyOTP: (otpData: VerifyOTPPayload) => Promise<AuthResult>;
  resendOTP: (emailData: ResendOTPPayload) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResult>;
  updateProfile: (profileData: UpdateProfilePayload | FormData) => Promise<AuthResult>;
  changePassword: (passwordData: ChangePasswordPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### Function Details

#### `login(credentials)`

Authenticates a user with email and password.

**Parameters:**
- `credentials: LoginPayload`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

**Example:**
```typescript
const result = await login({ email: 'user@example.com', password: 'password123' });
if (result.success) {
  // User is authenticated
}
```

#### `register(userData)`

Registers a new user account.

**Parameters:**
- `userData: RegisterPayload`

**Returns:**
```typescript
Promise<{ success: boolean; data?: any; error?: string }>
```

#### `verifyOTP(otpData)`

Verifies email OTP and activates account.

**Parameters:**
- `otpData: VerifyOTPPayload`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `resendOTP(emailData)`

Resends OTP verification email.

**Parameters:**
- `emailData: ResendOTPPayload`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `forgotPassword(email)`

Sends password reset email.

**Parameters:**
- `email: string`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `resetPassword(token, newPassword)`

Resets password using reset token.

**Parameters:**
- `token: string` - Password reset token
- `newPassword: string` - New password

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `updateProfile(profileData)`

Updates user profile information.

**Parameters:**
- `profileData: UpdateProfilePayload | FormData`

**Returns:**
```typescript
Promise<{ success: boolean; user?: User; error?: string }>
```

#### `changePassword(passwordData)`

Changes user password.

**Parameters:**
- `passwordData: ChangePasswordPayload`

**Returns:**
```typescript
Promise<{ success: boolean; error?: string }>
```

#### `logout()`

Logs out the current user and clears all auth data.

**Returns:**
```typescript
Promise<void>
```

**Note:** Automatically navigates to login page after logout.

#### `clearError()`

Clears the current error state.

**Returns:**
```typescript
void
```

---

## Integration Guide

### 1. Provider Setup

Wrap your app with `AuthProvider` in the root:

```typescript
// app/_layout.tsx (simplified example)
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext'; // Adjust path as needed
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient(); // Configure as needed

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <Stack>
              {/* Your Stack.Screen components */}
            </Stack>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
```

### 2. Using Auth in Components

```typescript
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { View, Text, TouchableOpacity } from 'react-native'; // Import React Native components

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      email: 'user@example.com',
      password: 'password123',
    });

    if (result.success) {
      // Handle success
    } else {
      // Handle error (result.error)
    }
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.firstName}!</Text>
      ) : (
        <TouchableOpacity onPress={handleLogin}>
          <Text>Login</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

### 3. Protected Routes

Use the auth state to protect routes:

```typescript
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { Redirect } from 'expo-router'; // Changed from Navigate from react-router-dom
import { View, Text } from 'react-native'; // Import React Native components

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />; // Changed from Navigate to Redirect
  }

  return <>{children}</>;
}
```

---

## Usage Examples

### Login Flow

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router'; // Import useRouter

const { login, isLoading, error } = useAuth();
const router = useRouter(); // Initialize router

const handleLogin = async (email: string, password: string) => {
  const result = await login({ email, password });

  if (result.success) {
    // Navigate to home or dashboard
    router.replace('/dashboard'); // Use router.replace
  } else {
    // Error is already set in Redux state
    console.error('Login failed:', result.error);
  }
};
```

### Registration Flow

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router'; // Import useRouter

const { register, verifyOTP, resendOTP } = useAuth();
const router = useRouter(); // Initialize router

// Step 1: Register
const handleRegister = async (userData) => {
  const result = await register(userData);
  if (result.success) {
    // Show OTP input screen
    // Example: set a state variable if this component manages the view
    // setShowOTP(true);
    console.log('Registration successful, OTP sent:', result.data);
  } else {
    console.error('Registration failed:', result.error);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async (email: string, otp: string) => {
  const result = await verifyOTP({ email, otp });
  if (result.success) {
    router.replace('/dashboard'); // Use router.replace
  } else {
    console.error('OTP verification failed:', result.error);
  }
};

// Step 3: Resend OTP if needed
const handleResendOTP = async (email: string) => {
  const result = await resendOTP({ email });
  if (result.success) {
    console.log('OTP resent successfully');
  } else {
    console.error('Failed to resend OTP:', result.error);
  }
};
```

### Profile Update

```typescript
const { updateProfile, user } = useAuth();

const handleUpdateProfile = async (profileData) => {
  try {
    const result = await updateProfile(profileData);
    if (result.success) {
      console.log('Updated user:', result.user);
    }
  } catch (error) {
    // Handle error
  }
};
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is automatically navigated to login page
};
```

---

## Best Practices

### 1. Error Handling

Always check the `success` property and handle errors:

```typescript
const result = await login(credentials);
if (!result.success) {
  alert(result.error);
}
```

### 2. Loading States

Use the `isLoading` state from context to show loading indicators:

```typescript
const { isLoading } = useAuth();
if (isLoading) {
  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}
```

### 3. State Access

Access state directly from context, not from Redux:

```typescript
// ✅ Good
const { user, isAuthenticated } = useAuth();

// ❌ Avoid (unless you need Redux-specific features)
const user = useSelector((state) => state.auth.user);
```

### 4. Token Management

Tokens are automatically managed by AuthContext and the API interceptors:
- Stored in Expo SecureStore on login
- User object persisted in AsyncStorage
- Refreshed automatically on 401 errors
- Cleared on logout

### 5. Navigation

Use `expo-router` navigation after auth actions:

```typescript
const { login } = useAuth();
const router = useRouter(); // Import and initialize useRouter

const handleLogin = async () => {
  const result = await login(credentials);
  if (result.success) {
    router.replace('/dashboard'); // Use router.replace
  }
};
```

---

## Troubleshooting

### State Not Persisting

- Check if Redux Persist is configured correctly
- Verify Expo SecureStore (for tokens) and AsyncStorage (for user) are available and not encountering errors.
- Ensure `auth` slice is in the persist whitelist

### Navigation Not Working

- Ensure `expo-router` is properly installed and configured.
- Check that navigation happens after async operations complete.
- Use `router.replace('/login')` for auth flows (e.g., after logout).

### Token Refresh Issues

- Check API interceptor configuration in `api/config.ts`
- Verify refresh token endpoint is correct
- Check network connectivity and Expo SecureStore access.

### Error State Not Clearing

- Use `clearError()` function to manually clear errors
- Errors are automatically cleared on new auth attempts

---

## Type Definitions

### User Type

```typescript
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'staff' | 'admin'; // Aligned with api.types.ts
  isActive: boolean;
  isEmailVerified: boolean; // Assuming this field exists, if not remove
  isPhoneVerified: boolean; // Assuming this field exists, if not remove
  createdAt: string;
  updatedAt: string;
}
```

### Auth Result Type

```typescript
interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
  user?: User;
}
```

---

## Notes

- All authentication state is managed through Redux.
- Tokens are persisted in Expo SecureStore for security and offline access.
- User profile data is persisted in AsyncStorage.
- User profile is automatically refreshed on app start.
- Background token validation doesn't clear tokens on failure (preserves offline access).
- Navigation is handled automatically on logout using Expo Router.
- Error messages come from the API when available.

---

**Last Updated:** February 2026  
**Version:** 1.1.0
