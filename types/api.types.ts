// appointment-client/types/api.types.ts

// Common Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string; // ISO 8601 date string
  endDate?: string;   // ISO 8601 date string
}

// Auth Types
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface ResendOTPPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'staff' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User Types
export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string; // URL or base64
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationPreferencesPayload {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  appointmentReminders?: boolean;
  promotions?: boolean;
}

// Service Types
export interface GetServicesParams extends PaginationParams {
  status?: 'active' | 'inactive';
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number; // minutes
  fullPrice: number;
  depositAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IService = Service;

// Appointment Types
export interface CreateAppointmentPayload {
  staffId: string;
  services: string[]; // Array of service IDs
  startTime: string; // ISO8601 datetime
  endTime: string;   // ISO8601 datetime
  notes?: string;
}

export interface ConfirmAppointmentPayload {
  method: 'MPESA' | 'PAYSTACK';
  phone: string;
}

export interface RescheduleAppointmentPayload {
  newStartTime: string; // ISO8601 datetime
  staffId?: string; // Optional: if staff also changes
}

export interface CancelAppointmentPayload {
  reason?: string;
}

export interface GetMyAppointmentsParams extends PaginationParams {
  status?: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  upcoming?: boolean;
}

export interface Appointment {
  _id: string;
  customerId: string;
  staffId: string | User; // Can be ID or populated User object
  services: Service[]; // Populated services
  startTime: string; // ISO8601 datetime
  endTime: string; // ISO8601 datetime
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  bookingFeeAmount: number;
  remainingAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type IAppointment = Appointment;

// Availability Types
export interface GetSlotsParams {
  staffId: string;
  serviceId: string | string[]; // Can be single ID or array of IDs
  date: string; // YYYY-MM-DD
}

export interface GetSlotsResponse {
  message?: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  available: boolean;
}

export type ITimeSlot = AvailabilitySlot;

export interface GetDayAvailabilityParams {
  staffId?: string;
  date: string; // YYYY-MM-DD
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
}

// Payment Types
export interface InitiatePaymentPayload {
  appointmentId: string;
  method: 'MPESA' | 'PAYSTACK';
  phone: string;
  services?: string[];
}

export interface ServicePaymentPayload {
  appointmentId: string;
  method: 'MPESA' | 'PAYSTACK';
  phone: string;
  amount: number;
}

export interface GetMyPaymentsParams extends PaginationParams {
  method?: string;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  customerId: string;
  appointmentId: string | any;
  amount: number;
  currency: string;
  type: string;
  method: 'MPESA' | 'PAYSTACK' | 'CASH';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  processorRefs?: {
    daraja?: {
      merchantRequestId?: string;
      checkoutRequestId?: string;
    };
    paystack?: {
      reference?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export type IPayment = Payment;

// Notification Types
export interface GetNotificationsParams extends PaginationParams {
  isUnread?: boolean;
  category?: 'appointment' | 'payment' | 'system' | 'promotional' | 'general';
}

export interface NotificationAction {
  label: string;
  type: 'link' | 'action';
  value: string;
}

export interface Notification {
  _id: string;
  id: string;
  recipient: string;
  recipientModel: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: 'appointment' | 'payment' | 'system' | 'promotional' | 'general';
  subject: string;
  message: string;
  status: string;
  isUnread: boolean;
  isRead?: boolean;
  actions?: NotificationAction[];
  createdAt: string;
  updatedAt: string;
  sentAt: string;
  __v?: number;
}

export type INotification = Notification;

// Contact Types
export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  userId?: string | null;  // set when submitter is authenticated
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}

export interface GetContactMessagesParams extends PaginationParams {
  status?: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
}

export interface SubmitContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
