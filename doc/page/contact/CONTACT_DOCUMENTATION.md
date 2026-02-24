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
- **Hook:** `useSubmitContactMessage()` from `@/tanstack/useContact`.
- **Endpoint:** `POST /api/contact`
- **Payload:** `{ name: string; email: string; phone?: string; subject: string; message: string }`.
- **Auth Required:** No (optional auth for auto-fill).

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
