import { api } from './config';
import type {
  // Auth types
  RegisterPayload,
  LoginPayload,
  VerifyOTPPayload,
  ResendOTPPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  RefreshTokenPayload,
  // User types
  UpdateProfilePayload,
  ChangePasswordPayload,
  UpdateNotificationPreferencesPayload,
  // Service types
  GetServicesParams,
  // Appointment types
  CreateAppointmentPayload,
  ConfirmAppointmentPayload,
  RescheduleAppointmentPayload,
  CancelAppointmentPayload,
  GetMyAppointmentsParams,
  // Availability types
  GetSlotsParams,
  GetDayAvailabilityParams,
  // Payment types
  InitiatePaymentPayload,
  ServicePaymentPayload,
  GetMyPaymentsParams,
  // Notification types
  GetNotificationsParams,
  // Contact types
  SubmitContactPayload,
  GetContactMessagesParams,
  IContact,
  // Common types
  PaginationParams,
} from '../types/api.types';

// ============================================
// Auth API
// ============================================
export const authAPI = {
  // Register a new user account.
  register: (userData: RegisterPayload) => api.post('/api/auth/register', userData),

  // Verify a one-time password (OTP) for authentication.
  verifyOTP: (otpData: VerifyOTPPayload) => api.post('/api/auth/verify-otp', otpData),

  // Request a new OTP for verification.
  resendOTP: (emailData: ResendOTPPayload) => api.post('/api/auth/resend-otp', emailData),

  // Login with credentials and receive tokens.
  login: (credentials: LoginPayload) => api.post('/api/auth/login', credentials),

  // Logout the current session.
  logout: () => api.post('/api/auth/logout'),

  // Request a password reset email.
  forgotPassword: (data: ForgotPasswordPayload) => api.post('/api/auth/forgot-password', data),

  // Reset password using a token link.
  resetPassword: (token: string, data: ResetPasswordPayload) => api.post(`/api/auth/reset-password/${token}`, data),

  // Refresh access token using a refresh token.
  refreshToken: (data: RefreshTokenPayload) => api.post('/api/auth/refresh-token', data),

  // Fetch the current authenticated user profile.
  getMe: () => api.get('/api/auth/me'),
};

// ============================================
// User API
// ============================================
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),

  updateProfile: (profileData: UpdateProfilePayload | FormData) =>
    profileData instanceof FormData
      ? api.put('/api/users/profile', profileData, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put('/api/users/profile', profileData),

  changePassword: (passwordData: ChangePasswordPayload) => api.put('/api/users/change-password', passwordData),

  getNotificationPreferences: () => api.get('/api/users/notifications'),

  updateNotificationPreferences: (preferences: UpdateNotificationPreferencesPayload) => api.put('/api/users/notifications', preferences),

  getStaff: (params?: any) => api.get('/api/users/staff', { params }),
};



// ============================================
// Service API
// ============================================
export const serviceAPI = {
  getAllServices: (params?: GetServicesParams) => api.get('/api/services', { params }),

  getService: (serviceId: string) => api.get(`/api/services/${serviceId}`),
};

// ============================================
// Appointment API
// ============================================
export const appointmentAPI = {
  create: (appointmentData: CreateAppointmentPayload) => api.post('/api/appointments', appointmentData),

  confirm: (appointmentId: string, paymentData: ConfirmAppointmentPayload) => api.post(`/api/appointments/${appointmentId}/confirm`, paymentData),

  reschedule: (appointmentId: string, data: RescheduleAppointmentPayload) => api.patch(`/api/appointments/${appointmentId}/reschedule`, data),

  cancel: (appointmentId: string, data?: CancelAppointmentPayload) => api.patch(`/api/appointments/${appointmentId}/cancel`, data),

  getMyAppointments: (params?: GetMyAppointmentsParams) => api.get('/api/appointments/my', { params }),

  getAppointment: (appointmentId: string) => api.get(`/api/appointments/${appointmentId}`),
};

// ============================================
// Availability API
// ============================================
export const availabilityAPI = {
  getSlots: (params: GetSlotsParams) => {
    // Handle multiple serviceIds - axios needs special handling for repeated query params
    const queryParams: any = {
      staffId: params.staffId,
      date: params.date,
    };
    
    // If serviceId is an array, we need to use paramsSerializer to format it correctly
    // The API expects: ?serviceId=id1&serviceId=id2 (not serviceId[]=id1&serviceId[]=id2)
    if (Array.isArray(params.serviceId)) {
      // Build URL manually for multiple serviceIds
      const baseUrl = '/api/availability/slots';
      const queryString = [
        `staffId=${encodeURIComponent(params.staffId)}`,
        ...params.serviceId.map(id => `serviceId=${encodeURIComponent(id)}`),
        `date=${encodeURIComponent(params.date)}`,
      ].join('&');
      return api.get(`${baseUrl}?${queryString}`);
    } else {
      queryParams.serviceId = params.serviceId;
      return api.get('/api/availability/slots', { params: queryParams });
    }
  },

  getDayAvailability: (params: GetDayAvailabilityParams) => api.get('/api/availability/day', { params }),
};



// ============================================
// Payment API
// ============================================
export const paymentAPI = {
  initiatePayment: (paymentData: InitiatePaymentPayload) => api.post('/api/payments/initiate', paymentData),

  servicePayment: (paymentData: ServicePaymentPayload) => api.post('/api/payments/service-payment', paymentData),

  getAllPayments: (params?: any) => api.get('/api/payments', { params }),

  getMyPayments: (params?: GetMyPaymentsParams) => api.get('/api/payments/my-payments', { params }),

  getPayment: (paymentId: string) => api.get(`/api/payments/${paymentId}`),

  queryMpesaStatus: (checkoutRequestId: string) => api.get(`/api/payments/status/${checkoutRequestId}`),
};

// ============================================
// Notification API
// ============================================
export const notificationAPI = {
  getNotifications: (params?: GetNotificationsParams) => api.get('/api/notifications', { params }),

  getNotification: (notificationId: string) => api.get(`/api/notifications/${notificationId}`),

  getUnreadCount: () => api.get('/api/notifications/unread-count'),

  getUnreadNotifications: (params?: { limit?: number }) => api.get('/api/notifications/unread', { params }),

  getNotificationsByCategory: (category: string) => api.get(`/api/notifications/category/${category}`),

  markAsRead: (notificationId: string) => api.patch(`/api/notifications/${notificationId}/read`),

  markAllAsRead: () => api.patch('/api/notifications/read-all'),

  deleteNotification: (notificationId: string) => api.delete(`/api/notifications/${notificationId}`),
};

// ============================================
// Contact API
// ============================================
export const contactAPI = {
  submitMessage: (messageData: SubmitContactPayload) => api.post('/api/contact', messageData),

  // Admin endpoint: Get all contact messages
  getContactMessages: (params?: GetContactMessagesParams) => api.get('/api/contact', { params }),

  // Admin endpoint: Get a single contact message by ID
  getContactMessageById: (contactId: string) => api.get(`/api/contact/${contactId}`),

  // Admin endpoint: Update a contact message (e.g., status)
  updateContactMessage: (contactId: string, data: Partial<IContact>) => api.patch(`/api/contact/${contactId}`, data),
};





// Export the api instance for custom requests
export { api };
export default api;
