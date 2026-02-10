# Appointment Client API Documentation

## Overview

This document provides comprehensive documentation for the API endpoints consumed by the Appointment Client application. The API follows RESTful conventions and uses JWT-based authentication.

**Base URL:** Configured via `EXPO_PUBLIC_API_URL` environment variable.

All API endpoints are prefixed with `/api`, so the full URL format is: `EXPO_PUBLIC_API_URL/api/{endpoint}`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Authentication Flow

1. **Login/Register** - Obtain access token and refresh token
2. **OTP Verification** - Verify account via OTP sent to email/phone
3. **Token Storage** - Refresh tokens are stored securely using Expo SecureStore; access tokens are held in-memory.
4. **Automatic Refresh** - Access tokens are automatically refreshed when expired (401 response)
5. **Token Refresh** - Use refresh token to get a new access token



## API Endpoints

### Auth Endpoints

**Base:** `/api/auth`

#### Register
- **Endpoint:** `POST /auth/register`
- **Description:** User registration with OTP verification
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "OTP sent to email/phone",
    "data": {
      "userId": "string",
      "email": "string"
    }
  }
  ```

#### Verify OTP
- **Endpoint:** `POST /auth/verify-otp`
- **Description:** Verify OTP and activate account
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string",
    "otp": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Account activated",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": { ... }
    }
  }
  ```

#### Resend OTP
- **Endpoint:** `POST /auth/resend-otp`
- **Description:** Resend OTP for verification
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```

#### Login
- **Endpoint:** `POST /auth/login`
- **Description:** User login (email/phone + password)
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "accessToken": "string",
      "refreshToken": "string",
      "user": { ... }
    }
  }
  ```

#### Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Logout user and invalidate tokens
- **Auth Required:** Yes

#### Forgot Password
- **Endpoint:** `POST /auth/forgot-password`
- **Description:** Send password reset email
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "string"
  }
  ```

#### Reset Password
- **Endpoint:** `POST /auth/reset-password/:token`
- **Description:** Reset password with token from email
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "newPassword": "string"
  }
  ```

#### Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Description:** Refresh JWT access token
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "string"
    }
  }
  ```

#### Get Current User
- **Endpoint:** `GET /auth/me`
- **Description:** Get current authenticated user profile
- **Auth Required:** Yes

---

### User Endpoints

**Base:** `/api/users`

#### Get Own Profile
- **Endpoint:** `GET /users/profile`
- **Description:** Get current user profile
- **Auth Required:** Yes

#### Update Own Profile
- **Endpoint:** `PUT /users/profile`
- **Description:** Update own profile
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "avatar": "string"
  }
  ```
- **Content-Type:** `application/json` or `multipart/form-data` (for avatar upload)

#### Change Password
- **Endpoint:** `PUT /users/change-password`
- **Description:** Change user password
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

#### Get Notification Preferences
- **Endpoint:** `GET /users/notifications`
- **Description:** Get notification preferences
- **Auth Required:** Yes

#### Update Notification Preferences
- **Endpoint:** `PUT /users/notifications`
- **Description:** Update notification preferences
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "email": "boolean",
    "sms": "boolean",
    "push": "boolean",
    "appointmentReminders": "boolean",
    "promotions": "boolean"
  }
  ```


---

### Service Endpoints

**Base:** `/api/services`

#### Get All Services
- **Endpoint:** `GET /services`
- **Description:** Get all *active* services (client-facing).
- **Auth Required:** No (returns active only) / Yes (Admin - returns all)
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `search` - Search by name/description
  - `status` - Filter by status: `'active'` or `'inactive'` (admin only)
  - **Note:** Use `status` parameter instead of `isActive`. `status=active` filters for active services.

#### Get Service by ID
- **Endpoint:** `GET /services/:serviceId`
- **Description:** Get single service details
- **Auth Required:** No


---

### Appointment Endpoints

**Base:** `/api/appointments`

#### Create Appointment
- **Endpoint:** `POST /appointments`
- **Description:** Create a new appointment (booking)
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "staffId": "string",
    "services": ["string"],
    "startTime": "ISO8601 datetime",
    "notes": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "customerId": "string",
      "staffId": "string",
      "services": [...],
      "startTime": "datetime",
      "endTime": "datetime",
      "status": "pending",
      "bookingFeeAmount": "number",
      "remainingAmount": "number"
    }
  }
  ```

#### Confirm Appointment
- **Endpoint:** `POST /appointments/:appointmentId/confirm`
- **Description:** Confirm appointment with booking fee payment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string"
  }
  ```

#### Reschedule Appointment
- **Endpoint:** `PATCH /appointments/:appointmentId/reschedule`
- **Description:** Reschedule an existing appointment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "newStartTime": "ISO8601 datetime",
    "staffId": "string"
  }
  ```

#### Cancel Appointment
- **Endpoint:** `PATCH /appointments/:appointmentId/cancel`
- **Description:** Cancel an appointment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "reason": "string"
  }
  ```


#### Get My Appointments
- **Endpoint:** `GET /appointments/my`
- **Description:** Get current user's appointments (customer)
- **Auth Required:** Yes
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `status` - Filter by status
  - `upcoming` - Boolean to get only upcoming

#### Get Appointment by ID
- **Endpoint:** `GET /appointments/:appointmentId`
- **Description:** Get single appointment details
- **Auth Required:** Yes


---

### Availability Endpoints

**Base:** `/api/availability`

#### Get Available Slots
- **Endpoint:** `GET /availability/slots`
- **Description:** Get available time slots for booking
- **Query Parameters:**
  - `staffId` - Staff member ID (required)
  - `serviceId` - Service ID (required, can be repeated for multiple services)
  - `date` - Date in YYYY-MM-DD format (required)
- **Note:** For multiple services, include `serviceId` parameter multiple times: `?serviceId=id1&serviceId=id2`. The API sums the durations of all services to calculate total duration for slot generation.
- **Auth Required:** No
- **Query Parameters:**
  - `staffId` - Staff member ID (required)
  - `serviceId` - Service ID (required for duration calculation)
  - `date` - Date in YYYY-MM-DD format (required)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "slots": [
        {
          "startTime": "09:00",
          "endTime": "09:30",
          "available": true
        }
      ]
    }
  }
  ```

#### Get Day Availability
- **Endpoint:** `GET /availability/day`
- **Description:** Get availability summary for a day
- **Auth Required:** No
- **Query Parameters:**
  - `staffId` - Staff member ID (optional, returns all staff if not provided)
  - `date` - Date in YYYY-MM-DD format (required)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "date": "2025-01-30",
      "totalSlots": 16,
      "availableSlots": 10,
      "bookedSlots": 6
    }
  }
  ```



---

### Payment Endpoints

**Base:** `/api/payments`

#### Initiate Payment
- **Endpoint:** `POST /payments/initiate`
- **Description:** Initiate payment for booking fee
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "appointmentId": "string",
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "paymentId": "string",
      "checkoutRequestId": "string",
      "status": "pending"
    }
  }
  ```

#### Service Payment
- **Endpoint:** `POST /payments/service-payment`
- **Description:** Pay remaining amount after appointment
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "appointmentId": "string",
    "paymentMethod": "mpesa" | "paystack",
    "phoneNumber": "string",
    "amount": "number"
  }

#### Get Payment by ID
- **Endpoint:** `GET /payments/:paymentId`
- **Description:** Get single payment details
- **Auth Required:** Yes
  ```


---

### Notification Endpoints

**Base:** `/api/notifications`


#### Get User Notifications
- **Endpoint:** `GET /notifications`
- **Description:** Get current user's notifications
- **Auth Required:** Yes
- **Query Parameters:**
  - `page` - Page number
  - `limit` - Items per page
  - `isRead` - Filter by read status

#### Get Unread Count
- **Endpoint:** `GET /notifications/unread-count`
- **Description:** Get unread notification count
- **Auth Required:** Yes

#### Get Unread Notifications
- **Endpoint:** `GET /notifications/unread`
- **Description:** Get all unread notifications
- **Auth Required:** Yes

#### Get Notifications by Category
- **Endpoint:** `GET /notifications/category/:category`
- **Description:** Get notifications by category
- **Auth Required:** Yes
- **Categories:** `appointment`, `payment`, `system`, `promotional`

#### Mark as Read
- **Endpoint:** `PATCH /notifications/:notificationId/read`
- **Description:** Mark notification as read
- **Auth Required:** Yes

#### Mark All as Read
- **Endpoint:** `PATCH /notifications/read-all`
- **Description:** Mark all notifications as read
- **Auth Required:** Yes

#### Delete Notification
- **Endpoint:** `DELETE /notifications/:notificationId`
- **Description:** Delete notification
- **Auth Required:** Yes

---

### Contact Endpoints

**Base:** `/api/contact`

#### Submit Contact Message
- **Endpoint:** `POST /contact`
- **Description:** Submit contact form message (public, optional auth for auto-fill)
- **Auth Required:** No (optional)
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "subject": "string",
    "message": "string"
  }
  ```






---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., slot already booked)
- `500` - Internal Server Error

## Error Handling

The Axios API client in `api/client.ts` automatically handles:
- **401 Unauthorized** - Attempts to refresh the access token using the refresh token from `Expo SecureStore`.
- **Token Refresh** - Automatically retries the original request after successful token refresh.
- **Global Error Handling** - Intercepts other API errors and can trigger global notifications or redirects.
- **FormData** - Automatically handles file uploads with proper Content-Type headers.

## Usage Example

```typescript
import { authAPI, appointmentAPI, serviceAPI } from '@/api';

// Login
const response = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get available slots (single service)
const slots = await availabilityAPI.getSlots({
  staffId: 'staffId',
  serviceId: 'serviceId',
  date: '2025-01-30'
});

// Get available slots (multiple services)
const slotsMultiple = await availabilityAPI.getSlots({
  staffId: 'staffId',
  serviceId: ['serviceId1', 'serviceId2'], // Array for multiple services
  date: '2025-01-30'
});

// Create appointment
const appointment = await appointmentAPI.create({
  staffId: 'staffId',
  services: ['serviceId1', 'serviceId2'],
  startTime: '2025-01-30T09:00:00Z',
  notes: 'Customer notes'
});

// Confirm with payment
await appointmentAPI.confirm(appointment.data._id, {
  paymentMethod: 'mpesa',
  phoneNumber: '254712345678'
});
```

## Notes

- All dates should be in ISO 8601 format
- File uploads use `FormData` and are automatically handled
- Pagination parameters: `page` (default: 1), `limit` (default: 10)

- Phone numbers should include country code (e.g., 254712345678 for Kenya)
- Availability slots are calculated dynamically based on staff working hours, breaks, and existing appointments

---

**Last Updated:** February 2026  
**Version:** 1.1.0