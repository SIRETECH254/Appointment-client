# Contact Page Documentation

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
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Platform, Linking, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSubmitContactMessage } from '@/tanstack/useContact';
import { useAuth } from '../../contexts/AuthContext';
```

## Context and State Management
- **Auth context:** `useAuth()` provides authenticated user details for pre-filling form fields.
- **TanStack Query:** `useSubmitContactMessage()` mutation hook handles sending contact messages.
- **Local form state:** `form` object (`{ name, email, phone, subject, message }`) managed with `useState`.
- **UI state:** `inlineMessage` (`{ type: 'success' | 'error'; text: string } | null`) for user feedback after submission.

## UI Structure
- **ScrollView:** Main container allowing the content to scroll on smaller devices.
- **Header Section:** Contains the main title and introductory text.
- **Map & Store Details Section:** Responsive layout displaying a map and store contact information cards side-by-side on larger screens, stacking vertically on smaller screens.
- **Contact Form Section:** Allows users to submit messages to the store.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Contact Us                                 │
│ Get in Touch                               │
├────────────────────────────────────────────┤
│ Map (lg: 1/2, xl: 3/5 width)               │
├────────────────────────────────────────────┤
│ Store Details (lg: 1/2, xl: 2/5 width)     │
│  - Location Card                           │
│  - Email Card                              │
│  - Phone Card                              │
│  - Instagram Card                          │
│  - Facebook Card                           │
├────────────────────────────────────────────┤
│ Send Us a Message (Contact Form)           │
│  - Your Name Input                         │
│  - Your Email Input                        │
│  - Your Phone (Optional) Input             │
│  - Subject Input                           │
│  - Message Input (Multiline)               │
│  - Submit Button                           │
│  - Inline Feedback (Success/Error)         │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Contact Us                                         │
│ Get in Touch                                       │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │                  Google Map                    │ │
│ │ (responsive width)                             │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Location: Ololua Ridge, Nairobi                │ │
│ │ Email: contact@appointmentclient.com           │ │
│ │ Phone: +254 712 345 678                        │ │
│ │ Instagram: @appointment_client                 │ │
│ │ Facebook: Appointment Client                   │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Send Us a Message                                  │
│                                                    │
│ Your Name [____________________________________]   │
│ Your Email [___________________________________]   │
│ Your Phone (Optional) [________________________]   │
│ Subject [______________________________________]   │
│ Message [______________________________________]   │
│         [______________________________________]   │
│         [______________________________________]   │
│                                                    │
│ [ Send Message (button) ]                          │
│                                                    │
│ (Inline Success/Error Message)                     │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Your Name:** `TextInput` pre-filled if authenticated, not editable.
- **Your Email:** `TextInput` pre-filled if authenticated, not editable, `keyboardType="email-address"`.
- **Your Phone (Optional):** `TextInput` pre-filled if authenticated, `keyboardType="phone-pad"`.
- **Subject:** `TextInput`.
- **Message:** `TextInput` with `multiline` and `numberOfLines={4}`.
- **Send Message:** `TouchableOpacity` with loading indicator.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `contactAPI.submitMessage`.
- **Hook:** `useSubmitContactMessage()` from `@/tanstack/useContact`.
- **Endpoint:** `POST /api/contact`
- **Headers:** Optionally includes `Authorization: Bearer <token>` if user is authenticated (for auto-fill).
- **Payload:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254700000000",  // Optional
    "subject": "Question about services",
    "message": "I would like to know more about..."
  }
  ```
- **Response contract:** `response.data.data` contains the submitted contact message.
- **Response structure:**
  ```json
  {
    "success": true,
    "message": "Message sent successfully",
    "data": {
      "contact": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254700000000",
        "subject": "Question about services",
        "message": "I would like to know more about...",
        "status": "NEW",
        "createdAt": "2026-02-16T00:00:00.000Z"
      }
    }
  }
  ```
- **Cache invalidation:** After successful submission, `queryClient.invalidateQueries({ queryKey: ['contactMessages'] })` is called.

## Components Used
- React Native: `View`, `Text`, `ScrollView`, `Platform`, `Linking`, `TouchableOpacity`, `TextInput`, `ActivityIndicator`, `Alert`.
- Third-party: `WebView` from `react-native-webview`, `MaterialIcons` from `@expo/vector-icons`.
- Custom: `DetailCard` component.
- Hooks: `useState`, `useCallback`, `useSubmitContactMessage`, `useAuth`.

## Error Handling
- **Client-side validation:** Ensures all required fields (name, email, subject, message) are filled.
- **Inline messages:** Displays `success` or `error` banners after form submission.
- **Loading state:** `ActivityIndicator` on the submit button while the API call is in progress.
- **API errors:** Catches errors from `submitMessageMutation` and displays a user-friendly message.

## Functions Involved

- **`handleInputChange`** — Updates form state when TextInput values change and clears inline messages.
  ```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [name]: value })); // Updates the specific form field.
    setInlineMessage(null); // Clears any inline messages.
  }, []); // Empty dependency array means this function is created once.
  ```

- **`handleSubmit`** — Validates form, submits contact message, and provides user feedback.
  ```tsx
  const handleSubmit = useCallback(async () => {
    // Basic client-side validation: Checks if all required fields are non-empty after trimming whitespace.
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setInlineMessage({ type: 'error', text: 'Please fill in all required fields (Name, Email, Subject, Message).' });
      return; // Stops the submission process.
    }

    try {
      // Calls the useSubmitContactMessage mutation to send the form data to the backend.
      await submitMessageMutation.mutateAsync(form);
      // If the API call is successful, display a success message to the user.
      setInlineMessage({ type: 'success', text: 'Your message has been sent successfully!' });
      
      // Conditional form clearing logic:
      if (!isAuthenticated) {
        // If user is not authenticated, clear all form fields after successful submission.
        setForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        // If user is authenticated, only clear subject and message (keep name, email, phone for convenience).
        setForm(prev => ({
          ...prev,
          subject: '',
          message: '',
        }));
      }
    } catch (error: any) {
      // If the API call fails, display an error message to the user.
      setInlineMessage({ type: 'error', text: error.message || 'Failed to send message. Please try again.' });
    }
  }, [form, submitMessageMutation, isAuthenticated]);
  ```

- **Autofill effect** — Autofills form fields from user profile if authenticated.
  ```tsx
  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);
  ```

## Navigation Flow
- This page is a public route, accessible via `/(public)/contact`.
- No direct navigation away from this page is triggered by the form submission itself, only feedback messages.

## Functions Involved
- **`handleInputChange(name, value)`:** Updates the form state for the given input field and clears any existing inline messages.
- **`handleSubmit()`:** Performs client-side validation, triggers the `useSubmitContactMessage` mutation, and manages inline feedback and form resetting based on authentication status.

## Future Enhancements
- Add reCAPTCHA or similar anti-spam measures to the contact form.
- Implement more robust email validation (regex pattern matching).
- Add character limits for subject and message fields.
- Store submitted messages in a local database for offline support before syncing.
- Integrate with a CRM or helpdesk system for managing contact inquiries.
