# Appointment Client - Frontend Documentation

## Table of Contents
- [Technology Stack](#technology-stack)
- [Required Packages](#required-packages)
- [Architecture Overview](#architecture-overview)
- [Screens & Navigation](#screens--navigation)
- [Components](#components)
- [Hooks](#hooks)
- [Constants](#constants)
- [Routing Structure](#routing-structure)
- [Styling Approach](#styling-approach)
- [UI Design System](#ui-design-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
- [Code Style & Best Practices](#code-style--best-practices)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Additional Resources](#additional-resources)
- [Version Information](#version-information)
- [Support & Contribution](#support--contribution)

---

## Technology Stack

- **Framework:** React Native
- **Language:** TypeScript
- **Routing:** Expo Router (file-based routing)
- **Styling:** React Native StyleSheet (with optional NativeWind for Tailwind-like utilities)
- **Build System:** Expo CLI
- **Platform:** iOS, Android, Web (optional)
- **Real-time:** Socket.io client for live appointment updates and notifications
- **State Management:** Redux Toolkit (or Context API) + TanStack Query
- **HTTP Client:** Axios

---

## Required Packages

### Core Dependencies
```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo": "~54.0.33",
  "expo-router": "~6.0.23",
  "typescript": "~5.9.2"
}
```

### Navigation
```json
{
  "expo-router": "~6.0.23",
  "@react-navigation/native": "^7.1.8",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0"
}
```

### Styling & UI
```json
{
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.1",
  "@expo/vector-icons": "^15.0.3",
  "expo-image": "~3.0.11"
}
```

### HTTP & API
```json
{
  "axios": "^1.7.0"
}
```

### State Management
```json
{
  "@reduxjs/toolkit": "^2.3.0",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0",
  "@tanstack/react-query": "^5.60.0"
}
```

### Real-Time
```json
{
  "socket.io-client": "^4.8.0"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.53.0",
  "@hookform/resolvers": "^3.9.0",
  "yup": "^1.4.0"
}
```

### Date & Time
```json
{
  "date-fns": "^4.1.0"
}
```

### Storage & Security
```json
{
  "@react-native-async-storage/async-storage": "^2.1.0",
  "expo-secure-store": "~14.0.0"
}
```

### Image & Media
```json
{
  "expo-image-picker": "~16.0.0",
  "expo-camera": "~16.0.0"
}
```

### Notifications
```json
{
  "expo-notifications": "~0.29.0"
}
```

### Dev Dependencies
```json
{
  "@types/react": "~19.1.0",
  "@types/react-native": "^0.73.0",
  "eslint": "^9.25.0",
  "eslint-config-expo": "~10.0.0"
}
```

---

## Architecture Overview

### Folder Structure
```
appointment-client/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx              # Root layout for providers
│   ├── +not-found.tsx           # 404 screen
│   │
│   ├── (public)/                # Screens accessible without login
│   │   ├── _layout.tsx          # Public layout
│   │   ├── index.tsx            # Landing/Home page
│   │   ├── contact.tsx          # Contact/Support page
│   │   ├── services.tsx         # Services list (now public)
│   │   │
│   │   └── (auth)/              # Authentication flow screens
│   │       ├── _layout.tsx
│   │       ├── login.tsx
│   │       ├── register.tsx
│   │       ├── verify-otp.tsx
│   │       ├── forgot-password.tsx
│   │       └── reset-password/[token].tsx
│   │
│   └── (authenticated)/         # Screens requiring login
│       ├── _layout.tsx          # Authenticated layout
│       │
│       ├── appointment/
│       │   ├── index.tsx        # My Appointments
│       │   ├── [id].tsx         # Appointment details
│       │   ├── [id]/payment.tsx # Payment screen
│       │   ├── select-service.tsx
│       │   ├── select-staff.tsx
│       │   ├── select-slot.tsx
│       │   └── confirm.tsx
│       │
│       ├── profile/
│       │   ├── index.tsx        # Profile
│       │   ├── edit.tsx         # Edit Profile
│       │   └── change-password.tsx # Change Password
│       │
│       ├── payments/
│       │   ├── [id].tsx         # Payment status
│       │   └── status/[checkoutRequestId].tsx
│       │
│       └── notifications/
│           ├── index.tsx        # Notifications list
│           └── [id].tsx         # Notification details
│
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Loading.tsx
│   │   └── EmptyState.tsx
│   ├── forms/
│   │   ├── FormInput.tsx
│   │   ├── Select.tsx
│   │   ├── DatePicker.tsx
│   │   └── Checkbox.tsx
│   ├── lists/
│   │   ├── ServiceCard.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── NotificationItem.tsx
│   │   └── StaffCard.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── TabBar.tsx
│       └── Container.tsx
│
├── tanstack/                    # TanStack Query hooks
│   ├── index.ts
│   ├── useAppointments.ts
│   ├── useAvailability.ts
│   ├── useContact.ts
│   ├── useDashboard.ts
│   ├── useNotifications.ts
│   ├── usePayments.ts
│   ├── useServices.ts
│   └── useUsers.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useThemeColor.ts
│   └── useSocket.ts
│
├── constants/
│   └── theme.ts                  # Brand colors (gold), typography, spacing
│
├── api/                          # API client and domain modules
│   ├── client.ts                 # Axios instance + interceptors for auth, token refresh, and error handling
│   ├── auth.ts                   # Auth-related API calls (login, register, etc.)
│   ├── appointments.ts           # Appointment-related API calls (create, confirm, get my, etc.)
│   ├── services.ts               # Service-related API calls (get all, get by ID)
│   ├── availability.ts           # Availability-related API calls (get slots, get day availability)
│   ├── payments.ts               # Payment-related API calls (initiate, service payment, get payment)
│   ├── notifications.ts          # Notification-related API calls (get, mark as read, delete)
│   ├── contact.ts                # Contact form submission API calls
│   └── index.ts                  # Central export for all API modules
│
├── store/                        # Redux store
│   ├── index.ts
│   ├── slices/
│   │   └── authSlice.ts
│   └── persistConfig.ts
│
├── types/                        # Shared TypeScript types
│   ├── index.ts                  # Re-exports for various types
│   └── api.types.ts              # Interfaces and types for API requests and responses
│
├── utils/
│   ├── date.ts
│   ├── validation.ts
│   └── formatters.ts
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── app.json
├── package.json
├── tsconfig.json
└── .env
```

### Architecture Patterns

#### 1. **Routing**
- Expo Router with file-based routing (similar to Next.js).
- Route groups: `(auth)` for authentication screens.
- Dynamic routes: `[id].tsx` for detail screens, `[token].tsx` for reset password.
- Layout routes: `_layout.tsx` files define navigation structure.
- Auth guard: redirect unauthenticated users to login.

#### 2. **Component Layers**
- **UI Components:** Base design system in `components/ui/` (Button, Input, Card, Modal, Alert, Badge, Loading, EmptyState).
- **Form Components:** Form-specific inputs in `components/forms/` (FormInput, Select, DatePicker, Checkbox).
- **List Components:** Data presentation cards in `components/lists/` (ServiceCard, AppointmentCard, NotificationItem, StaffCard).
- **Layout Components:** Navigation and page structure in `components/layout/` (Header, TabBar, Container).
- **Screen Components:** Full screens in `app/` directory.

#### 3. **Styling**
- React Native StyleSheet for component styles.
- Design tokens in `constants/theme.ts` (gold palette, spacing, typography).
- Optional NativeWind for Tailwind-like utilities if preferred.
- Platform-specific styles using `Platform.select()`.

#### 4. **State Management**
- **Redux (or Context):** Global app state; auth slice (user, tokens) with redux-persist (AsyncStorage) for mobile.
- **AuthProvider:** Wraps app; exposes login, logout, refresh, user, isAuthenticated, isLoading; coordinates token and redirects.
- **TanStack Query:** Server state for services, appointments, payments, notifications, availability; query/mutation hooks per domain.
- **Local state:** useState/useReducer for UI-only state (modals, filters, form draft).
- **Navigation state:** Expo Router (params, search params).

#### 5. **Services Layer**
- Central API client in `api/client.ts` (axios with base URL, request/response interceptors for auth and refresh).
- Domain modules in `api/` (auth, services, appointments, payments, notifications, availability, contact) calling the client.
- Environment variable `EXPO_PUBLIC_API_URL` for base URL.

---

## Screens & Navigation

### 1. Root Layout (`app/_layout.tsx`)
**Purpose:** Root navigation structure and app-wide configuration.

**Features:**
- Expo Router setup (Stack navigator).
- Providers: QueryClientProvider (TanStack Query), Redux Provider (with persist), AuthProvider, SocketProvider.
- Route tree: auth stack, main tabs, detail screens.
- Global error boundary and loading states.

**Routes:**
- `(auth)/*` — Authentication screens (login, register, verify-otp, forgot-password, reset-password).
- `appointment/index` — My Appointments.
- `appointment/select-service`, `appointment/select-staff`, `appointment/select-slot`, `appointment/confirm` — Booking flow.
- `appointments/[id]` — Appointment details.
- `payments/*` — Payment screens.
- `notifications/*` — Notification screens.
- `contact` — Contact/Support screen.
- `profile/index` — Profile.
- `profile/edit` — Edit Profile.
- `profile/change-password` — Change Password.
- `+not-found` — 404 screen.

---

### 2. Authentication Screens

#### Login (`app/(auth)/login.tsx`)
**Purpose:** User authentication.

**Features:**
- Email or phone + password form.
- Form validation with react-hook-form and yup.
- Error display.
- Redirect to home on success.
- Links to register, forgot password, and verify OTP.

**Backend:** `POST /api/auth/login`

**Navigation:**
- On success → `/appointment/index` (home)
- Link to → `/(auth)/register`
- Link to → `/(auth)/forgot-password`
- Link to → `/(auth)/verify-otp`

---

#### Register (`app/(auth)/register.tsx`)
**Purpose:** User registration.

**Features:**
- Form: firstName, lastName, email, phone, password, confirmPassword.
- Form validation.
- Submit creates account and sends OTP.
- Redirect to verify-otp screen.

**Backend:** `POST /api/auth/register`

**Navigation:**
- On success → `/(auth)/verify-otp`
- Link to → `/(auth)/login`

---

#### Verify OTP (`app/(auth)/verify-otp.tsx`)
**Purpose:** Verify OTP and activate account.

**Features:**
- Email or phone + OTP input (6 digits).
- Resend OTP option with countdown.
- Auto-submit on complete OTP entry.
- Redirect to home on success.

**Backend:** `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp`

**Navigation:**
- On success → `/appointment/index` (home)
- Link to → `/(auth)/login`

---

#### Forgot Password (`app/(auth)/forgot-password.tsx`)
**Purpose:** Request password reset.

**Features:**
- Email input.
- Submit sends reset instructions.
- Success message and link to login.

**Backend:** `POST /api/auth/forgot-password`

**Navigation:**
- On success → Show success message, link to `/(auth)/login`

---

#### Reset Password (`app/(auth)/reset-password/[token].tsx`)
**Purpose:** Set new password with token.

**Features:**
- Token from URL params.
- New password + confirm password fields.
- Validation; submit reset.
- Redirect to login on success.

**Backend:** `POST /api/auth/reset-password/:token`

**Navigation:**
- On success → `/(auth)/login`

---

### 3. Authenticated Screens (`app/(authenticated)/`)

#### My Appointments (`app/appointment/index.tsx`)
**Purpose:** View customer's appointments and quick actions.

**Features:**
- List of appointments with filters (status: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW).
- Appointment cards: staff name, services, date/time, status badge, booking fee, remaining amount.
- Quick actions: Book Appointment, View Services.
- Pull-to-refresh.
- Tap appointment → Appointment details.

**Backend:** `GET /api/appointments/my?status=...&page=...&limit=...`

**Navigation:**
- Tap appointment → `appointments/[id]`
- Book Appointment → `appointment/select-service`

---

#### Select Service (`app/appointment/select-service.tsx`)
**Purpose:** Choose service(s) for appointment.

**Features:**
- List of services.
- Multi-select support (can book multiple services).
- Service cards with duration and price.
- Total duration and price calculation.
- "Next" button to select staff.

**Backend:** `GET /api/services?status=active`

**Navigation:**
- Next → `appointment/select-staff?serviceIds=...`

---

#### Select Staff (`app/appointment/select-staff.tsx`)
**Purpose:** Choose staff member.

**Features:**
- List of staff who provide selected services.
- Staff cards: name, avatar, services provided.
- "Next" button to select time slot.

**Backend:** `GET /api/staff` (filtered by services)

**Navigation:**
- Next → `appointment/select-slot?staffId=...&serviceIds=...`

---

#### Select Slot (`app/appointment/select-slot.tsx`)
**Purpose:** Choose appointment date and time.

**Features:**
- Date picker (calendar or date selector).
- Available time slots for selected date (from availability API).
- Slot cards: time range, duration.
- Past slots disabled/grayed out.
- "Next" button to confirm booking.

**Backend:** `GET /api/availability/slots?staffId=...&serviceId=...&date=...`

**Navigation:**
- Next → `appointment/confirm?staffId=...&serviceIds=...&startTime=...&endTime=...`

---

#### Confirm Booking (`app/appointment/confirm.tsx`)
**Purpose:** Review and confirm appointment.

**Features:**
- Summary: staff, services, date/time, total price, booking fee, remaining amount.
- Terms and conditions checkbox.
- "Confirm Booking" button.
- Creates appointment (PENDING status).
- Redirects to appointment details or payment screen.

**Backend:** `POST /api/appointments`

**Navigation:**
- On success → `appointments/[id]` or `appointments/[id]/payment`

---

#### Profile (`app/profile/index.tsx`)
**Purpose:** View and manage profile.

**Features:**
- Display current user (name, email, phone, avatar).
- Edit profile button.
- Change password link.
- Notification preferences toggle.
- Logout button.

**Backend:** `GET /api/users/profile`, `GET /api/users/notifications`

**Navigation:**
- Edit profile → `profile/edit`
- Change password → `profile/change-password`
- Logout → `/(auth)/login`

---

### 4. Appointment Details (`app/appointments/[id].tsx`)
**Purpose:** View single appointment.

**Features:**
- Appointment details: staff, services, date/time, status, booking fee, remaining amount.
- Status badge (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW).
- Actions based on status:
  - PENDING: Pay Booking Fee, Cancel
  - CONFIRMED: Pay Remaining, Reschedule, Cancel
  - COMPLETED: View receipt (if applicable)
- Payment history section.
- Real-time status updates via Socket.io.

**Backend:** `GET /api/appointments/:appointmentId`

**Navigation:**
- Pay Booking Fee → `appointments/[id]/payment?type=booking-fee`
- Pay Remaining → `appointments/[id]/payment?type=remaining`
- Cancel → Confirmation modal, then update status

---

### 5. Payment Screens

#### Payment (`app/appointments/[id]/payment.tsx`)
**Purpose:** Initiate payment (booking fee or remaining amount).

**Features:**
- Payment amount display (booking fee or remaining).
- Payment method selection: MPESA, CARD, CASH.
- Phone input for MPESA.
- Email input for CARD.
- "Pay Now" button.
- Initiates payment and shows payment status screen.

**Backend:** 
- Booking fee: `POST /api/appointments/:appointmentId/confirm`
- Remaining: `POST /api/payments/service-payment`

**Navigation:**
- On initiate → `payments/status/[checkoutRequestId]` (for MPESA) or Paystack redirect (for CARD)

---

#### Payment Status (`app/payments/status/[checkoutRequestId].tsx`)
**Purpose:** Track payment status.

**Features:**
- Payment details: amount, method, status.
- Loading state while checking.
- Poll payment status API for MPESA.
- Success/error states.
- "Back to Appointment" button.

**Backend:** `GET /api/payments/status/:checkoutRequestId`

**Navigation:**
- On success → `appointments/[id]`
- On failure → Retry or back to appointment

---

### 6. Notification Screens

#### Notifications List (`app/notifications/index.tsx`)
**Purpose:** Notification center.

**Features:**
- List of notifications with filters (category: general, appointment, payment; status: unread, read).
- Unread count badge.
- Notification items: subject, message preview, timestamp, read/unread indicator.
- Tap notification → Notification details.
- Swipe to mark as read or delete.
- "Mark all as read" button.
- Pull-to-refresh.
- Real-time updates via Socket.io.

**Backend:** `GET /api/notifications?category=...&status=...&page=...&limit=...`

**Navigation:**
- Tap notification → `notifications/[id]`

---

#### Notification Details (`app/notifications/[id].tsx`)
**Purpose:** View single notification.

**Features:**
- Full notification: subject, message, category, timestamp.
- Mark as read on view.
- Action buttons (if notification has actions): Confirm Appointment, Reschedule, etc.
- Delete button.

**Backend:** `GET /api/notifications/:notificationId`, `PATCH /api/notifications/:notificationId/read`

**Navigation:**
- Action button → Navigate to route or call API endpoint
- Back → `notifications/index`

---

### 7. Contact/Support (`app/contact.tsx`)
**Purpose:** Submit contact form.

**Features:**
- Form: name, email, phone (optional), subject, message.
- Validation and submit.
- Success message.

**Backend:** `POST /api/contact`

**Navigation:**
- On success → Show success message, clear form

---

### 8. Profile Management

#### Edit Profile (`app/profile/edit.tsx`)
**Purpose:** Edit own profile.

**Features:**
- Pre-filled form: firstName, lastName, phone, avatar upload.
- Image picker for avatar.
- Save and success/error feedback.

**Backend:** `PUT /api/users/profile`

**Navigation:**
- On success → `profile/index`

---

#### Change Password (`app/profile/change-password.tsx`)
**Purpose:** Change authenticated user's password.

**Features:**
- Current password, new password, confirm new password.
- Validation and submit.
- Success message and redirect to profile.

**Backend:** `PUT /api/users/change-password`

**Navigation:**
- On success → `profile/index`

---

## Components

### UI Components (`components/ui/`)

- **Button:** Variants primary, secondary, danger, ghost, disabled; gold primary per design system; touch feedback.
- **Input:** Text input with border, focus, error state; optional label and error message; platform-specific keyboard types.
- **Card:** Container with optional accent strip (gold); padding, border-radius, shadow; touchable for navigation.
- **Modal:** Bottom sheet or center modal; title, content, footer actions; close on backdrop/escape.
- **Alert:** Success, error, info variants; icon + message; auto-dismiss or manual close.
- **Badge:** Status badges (e.g. PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW); unread count badges.
- **Loading:** Spinner/activity indicator; full-screen or inline.
- **EmptyState:** Empty list placeholder with icon, message, and optional action button.

### Form Components (`components/forms/`)

- **FormInput:** Label + input + error message; optional required indicator; integrates with react-hook-form.
- **Select:** Picker/dropdown for single select (e.g. staff, service, status); native picker on mobile.
- **DatePicker:** Date and/or time selection (appointments, booking); native date/time pickers.
- **Checkbox:** Boolean option; custom checkbox component.

### List Components (`components/lists/`)

- **ServiceCard:** Service name, description, duration, price; "Book Now" button; tap navigates to booking.
- **AppointmentCard:** Staff name, services, date/time, status badge, amounts; tap navigates to details.
- **NotificationItem:** Subject, message preview, timestamp, read indicator; swipe actions; tap navigates to details.
- **StaffCard:** Staff name, avatar, services provided; tap navigates to staff details or booking.

### Layout Components (`components/layout/`)

- **Header:** Top bar with title, back button (if applicable), action buttons (e.g. notifications bell).
- **TabBar:** Bottom tab navigator (home, services, appointments, profile); custom styling with gold accent.
- **Container:** Screen content wrapper with safe area insets and padding.

---

## Hooks

- **useAuth:** From AuthProvider; returns `{ user, isAuthenticated, isLoading, login, logout, refresh }`. Used for guard and header.
- **useThemeColor:** Returns theme color by name (e.g. primary, accent) for programmatic styling.
- **useSocket:** Connects to Socket.io server; subscribes to user-specific events (notifications, appointment updates).
- **TanStack Query hooks:** Co-locate with API or in `hooks/queries/`: e.g. `useServices`, `useService(id)`, `useAppointments`, `useAppointment(id)`, `usePayments`, `useNotifications`, `useAvailabilitySlots`. Each encapsulates `useQuery`/`useMutation` and API calls.

---

## Constants

### Theme Constants (`constants/theme.ts`)

#### Brand Palette (Gold theme)
```typescript
export const BrandColors = {
  primary: '#D4AF37',      // Primary gold - buttons, active states
  accent: '#C5A028',       // Accent gold - hover, emphasis
  soft: '#E8C547',         // Soft gold - secondary elements, success
  lightTint: '#FFF8E7',    // Light tint - card backgrounds

  text: '#000000',
  background: '#ffffff',
  border: '#e5e5e5',

  error: '#a33c3c',
  success: '#2d8a2d',
  disabled: '#f0f0f0',
  disabledText: '#999999',
};
```

#### Typography
- Headings: System font (SF Pro on iOS, Roboto on Android), bold/semibold; sizes 28–32px (h1), 22–26px (h2), 18–20px (h3).
- Body: System font, regular; 14–16px.
- Caption: 12px; labels, helper text.

#### Spacing (4-point scale)
- xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, 2xl: 48, 3xl: 64 (px).
- Use in StyleSheet: `padding: 16` (base), `margin: 24` (lg), etc.

---

## Routing Structure

### Route Hierarchy

- **Public Routes:**
  - **Auth Flow:** `/(public)/(auth)/login`, `/(public)/(auth)/register`, `/(public)/(auth)/verify-otp`, `/(public)/(auth)/forgot-password`, `/(public)/(auth)/reset-password/[token]`
  - **Main Public Pages:** `/(public)/`, `/(public)/contact`, `/(public)/services`
- **Authenticated Routes:**
  - **Main Tabs:** `/(authenticated)/(tabs)/` (index/home, appointments, profile)
  - **Booking:** `/(authenticated)/book/select-service`, `/(authenticated)/book/select-staff`, `/(authenticated)/book/select-slot`, `/(authenticated)/book/confirm`
  - **Appointments:** `/(authenticated)/appointments/[id]`, `/(authenticated)/appointments/[id]/payment`
  - **Payments:** `/(authenticated)/payments/status/[checkoutRequestId]`
  - **Notifications:** `/(authenticated)/notifications`, `/(authenticated)/notifications/[id]`
  - **Profile Management:** `/(authenticated)/profile/edit`, `/(authenticated)/profile/change-password`
  - **Others:** `/(authenticated)/modal`
- **404:** `+not-found`


### Auth Guard Pattern

- Protected screens check `isAuthenticated` from AuthProvider (or Redux).
- If `isLoading`, show loading UI.
- If `!isAuthenticated`, redirect to `/(auth)/login` (and optionally save intended URL for post-login redirect).
- Otherwise render screen.

### Expo Router File Structure

```
app/
├── _layout.tsx                 # Root layout with providers
├── +not-found.tsx              # 404 screen
├── (public)/                   # Screens accessible without login
│   ├── _layout.tsx             # Public layout
│   ├── index.tsx               # Landing/Home page
│   ├── contact.tsx             # Contact/Support page
│   ├── services.tsx            # Services list (now public)
│   └── (auth)/                 # Authentication flow screens
│       ├── _layout.tsx
│       ├── login.tsx
│       ├── register.tsx
│       ├── verify-otp.tsx
│       ├── forgot-password.tsx
│       └── reset-password/[token].tsx
├── (authenticated)/            # Screens requiring login
│   ├── _layout.tsx             # Authenticated layout
│   ├── modal.tsx               # Global modal (e.g., for authenticated actions)
│   ├── (tabs)/                 # Main app tabs (without services.tsx)
│   │   ├── _layout.tsx         # Tab navigator
│   │   ├── index.tsx
│   │   ├── appointments.tsx
│   │   └── profile.tsx
│   ├── book/                   # Booking flow
│   │   ├── _layout.tsx
│   │   ├── select-service.tsx
│   │   ├── select-staff.tsx
│   │   ├── select-slot.tsx
│   │   └── confirm.tsx
│   ├── appointments/
│   │   ├── [id].tsx
│   │   └── [id]/payment.tsx
│   ├── payments/
│   │   ├── [id].tsx
│   │   └── status/[checkoutRequestId].tsx
│   └── notifications/
│       ├── index.tsx
│       └── [id].tsx
```

---

## Styling Approach

- **React Native StyleSheet:** Primary styling method; create StyleSheet objects in components or separate style files.
- **Theme integration:** Use colors from `constants/theme.ts` in styles (e.g. `backgroundColor: BrandColors.primary`).
- **Platform-specific:** Use `Platform.select()` for iOS/Android differences.
- **Responsive:** Use `Dimensions` API or percentage-based widths for responsive layouts.
- **Safe Areas:** Use `react-native-safe-area-context` for notch/status bar handling.

---

## UI Design System

### Overview

The Appointment Client UI uses a **gold** theme for primary actions and accents, with neutral backgrounds and text for readability.

**Design philosophy:** Professional, minimal, efficient; gold used for focus and key actions; mobile-optimized touch targets.

### Brand Palette (Gold)

| Role           | Hex       | Usage                          | Usage Example       |
|----------------|-----------|--------------------------------|---------------------|
| Primary Gold   | `#D4AF37` | Primary buttons, active icons  | Book button         |
| Accent Gold    | `#C5A028` | Hover, emphasis                | Active tab indicator|
| Soft Gold      | `#E8C547` | Secondary, success             | Success messages   |
| Light Tint     | `#FFF8E7` | Card backgrounds, subtle      | Card background     |
| Text           | `#000000` | Primary text                   | Body text           |
| Background     | `#ffffff` | Screen background              | Screen background   |
| Border         | `#e5e5e5` | Dividers, inputs               | Input borders       |

### Typography

- **H1:** System font 700, 28–32px; screen titles.
- **H2:** System font 600, 22–26px; section titles.
- **H3:** System font 600, 18–20px; subsection.
- **Body:** System font 400, 14–16px; general text.
- **Caption:** System font 300/400, 12px; labels, helper text.

### Spacing & Grid

- 4-point scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Minimum touch target: 44px (iOS) / 48px (Android).
- Section spacing: 24–32px; screen-level up to 48px.

### Buttons

- **Primary:** Gold background (`#D4AF37`), white text; touch feedback; min height 48px; border-radius 8px.
- **Secondary:** White background, gold border and text.
- **Danger:** Red for delete/destructive actions.
- **Ghost:** Transparent, gold text.
- **Disabled:** Gray background and text.

### Forms & Inputs

- Border `#e5e5e5`; focus border gold (2px).
- Label above input; error text and border in red.
- Border-radius 8px.
- **Form validation:** Use **yup** for schema validation with **react-hook-form** (`@hookform/resolvers/yup`).

### Cards & Containers

- White background; padding 16px; border-radius 12px; optional shadow.
- Optional 4px top accent strip in gold.

### Lists

- Cards with touch feedback.
- Swipe actions for notifications (mark as read, delete).
- Pull-to-refresh support.

### Notifications & Alerts

- Success: soft gold or green; icon + message.
- Error: red; icon + message.
- Info: light tint background; dark text.

### Accessibility

- Contrast: body text and UI meet WCAG AA (e.g. 4.5:1).
- Touch targets: min 44px (iOS) / 48px (Android).
- Labels: all inputs have associated labels.
- Screen reader support: use `accessibilityLabel` and `accessibilityHint`.

### Responsive

- Use `Dimensions` API for screen size detection.
- Flexible layouts with `flex: 1` and percentage widths.
- Safe area insets for notch/status bar.

### Component Directory

- `components/ui/` — Button, Input, Card, Modal, Alert, Badge, Loading, EmptyState.
- `components/layout/` — Header, TabBar, Container.
- `components/forms/` — FormInput, Select, DatePicker, Checkbox.
- `components/lists/` — ServiceCard, AppointmentCard, NotificationItem, StaffCard.

---

## State Management

- **Redux (or Context):** Global app state; auth slice holds user and tokens. Persist to AsyncStorage via redux-persist so sessions survive app restart. Serialize only safe fields (no raw password).
- **AuthProvider:** Wraps app; reads/writes auth state (Redux or local); provides login, logout, refresh, user, isAuthenticated, isLoading. On mount, optionally validate token or refresh; redirect unauthenticated users from protected routes.
- **TanStack Query:** Server state for all API-backed lists and details (services, appointments, payments, notifications, availability). Use default staleTime (e.g. 5 min) and gcTime (e.g. 10 min); query keys per resource and filters; mutations invalidate relevant queries. Co-locate hooks with API modules or in `hooks/queries/`.
- **Local state:** useState/useReducer for modals, filters, form draft, UI toggles.
- **Navigation state:** Expo Router (params, search params); no duplicate state for route data.
- **Socket state:** Real-time updates for notifications and appointment status changes.

---

## API Integration

### API Client

- **File:** `api/client.ts`.
- **Base URL:** From `process.env.EXPO_PUBLIC_API_URL` (e.g. `http://localhost:4500`).
- **Request interceptor:** Attaches `Authorization: Bearer <accessToken>` retrieved from `Expo SecureStore`.
- **Response interceptor:** On `401 Unauthorized`, attempts to refresh the access token using the refresh token stored in `Expo SecureStore`. On successful refresh, retries the original request. On refresh failure, clears all stored tokens (`accessToken` and `refreshToken`) and logs out the user (handled by `AuthProvider`). For other errors, global error handling can trigger notifications or redirects.
- **Content-Type:** `application/json` for JSON bodies; for file uploads, `FormData` is automatically handled with proper headers.

### Domain Modules

- **auth:** login, register, verifyOTP, resendOTP, forgotPassword, resetPassword, refreshToken, getMe.
- **user:** getProfile, updateProfile, changePassword, getNotificationPreferences, updateNotificationPreferences.
- **services:** getAllServices, getService.
- **appointments:** create, confirm, reschedule, cancel, getMyAppointments, getAppointment.
- **availability:** getSlots, getDayAvailability.
- **payments:** initiatePayment, servicePayment, getPayment.
- **notifications:** getNotifications, getNotification, getUnreadCount, getUnreadNotifications, getNotificationsByCategory, markAsRead, markAllAsRead, deleteNotification.
- **contact:** submitMessage.

### Environment Variables

- `EXPO_PUBLIC_API_URL` — Backend API base URL (e.g. `http://localhost:4500`).
- Do not put secrets (e.g. API keys for server-only use) in Expo env; backend handles those.

### Socket.io Integration

- Connect to backend Socket.io server on app start (if authenticated).
- Subscribe to user-specific room: `user_${userId}`.
- Listen for events: `notification`, `appointment.updated`, `payment.updated`.
- Update local state (TanStack Query cache) on real-time events.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Expo Go app on physical device (for testing)

### Installation

1. Navigate to project: `cd appointment-client`
2. Install dependencies: `npm install`
3. Copy env: `cp .env.example .env` and set `EXPO_PUBLIC_API_URL` to your backend URL.
4. Start dev server: `npm start` or `expo start`
5. Run on iOS: `npm run ios` or press `i` in Expo CLI
6. Run on Android: `npm run android` or press `a` in Expo CLI
7. Run on web: `npm run web` or press `w` in Expo CLI

### Development

- Run backend (Appointment API) so API calls resolve (see backend doc).
- Use Expo Router and AuthProvider so protected routes redirect to login when not authenticated.
- Enable hot reload for faster development.
- Use React Native Debugger or Flipper for debugging.

### Building for Production

- **iOS:** `eas build --platform ios` (requires Expo Application Services account)
- **Android:** `eas build --platform android`
- Or use `expo build` (legacy) for standalone builds.

---

## Code Style & Best Practices

- **TypeScript:** Strict mode; type props and API responses; avoid `any` where possible.
- **Path aliases:** Use `@/` for `app/` or `src/` (e.g. `@/components/ui/Button`, `@/api/client`). Configure in `tsconfig.json`.
- **Components:** Functional components; named exports for components, default for screen/route components if preferred.
- **Naming:** PascalCase for components; camelCase for files (e.g. `ServiceCard.tsx`); `use` prefix for hooks; UPPER_SNAKE for constants.
- **Props:** Define interfaces or types for component props and API payloads.
- **Error Handling:** Use try-catch for async operations; show user-friendly error messages.
- **Loading States:** Always show loading indicators for async operations.
- **Optimization:** Use `React.memo` for expensive components; use `useMemo` and `useCallback` appropriately.

---

## Security Considerations

- **Token storage (mobile):** Access token in memory (Redux/context) is preferable; if persisting, use redux-persist to AsyncStorage and accept XSS risk for refresh token, or use Expo SecureStore for sensitive data. Do not store tokens in plain AsyncStorage for production.
- **HTTPS:** Use HTTPS in production for API and app.
- **Secrets:** No backend API secrets or private keys in frontend env or code.
- **Auth:** Validate token and refresh before sensitive operations; redirect to login on 401 after refresh failure.
- **Deep Linking:** Validate deep link parameters; do not trust URL parameters for sensitive operations.
- **Biometric Auth:** Consider adding biometric authentication for sensitive actions (optional).

---

## Testing

- **Unit/component:** Jest + React Native Testing Library; test critical UI and hooks.
- **E2E (optional):** Detox or Maestro for mobile E2E testing of login flow and booking flow.
- **API mocking:** MSW (Mock Service Worker) or similar for tests that call API.

---

## Additional Resources

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Hook Form](https://react-hook-form.com/)
- Backend: Appointment API documentation at `../APPOINTMENT SERVER/appointment-api/doc/`

---

## Version Information

- **Document version:** 1.0.0
- **React Native:** 0.81.5
- **Expo:** 54.x
- **TypeScript:** 5.9.x
- **Expo Router:** 6.x

---

## Support & Contribution

- **New features:** Add screens under `app/`; add API modules and query hooks as needed; document new screens in this file.
- **New components:** Place in `components/ui/`, `components/layout/`, `components/forms/`, or `components/lists/` as appropriate; follow design system (gold theme, spacing, typography).
- **Doc updates:** Keep this document in sync with route list, API modules, and design tokens when adding or changing features.

---

**Last Updated:** January 2026
