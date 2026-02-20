import { format, isToday } from 'date-fns';

export const formatAppointmentDateTime = (dateString: string | Date | undefined) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
};

export const formatAppointmentStatus = (status: string | undefined) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
};

export const getAppointmentStatusVariant = (status: string | undefined) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'badge-soft';
    case 'CONFIRMED':
      return 'badge-success';
    case 'COMPLETED':
      return 'badge';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'badge-error';
    default:
      return 'badge-soft';
  }
};

export const canRescheduleAppointment = (appointment: any) => {
  const status = appointment?.status?.toUpperCase();
  return status === 'CONFIRMED' || status === 'PENDING';
};

export const canCancelAppointment = (appointment: any) => {
  if (!appointment?.startTime) return false;
  const status = appointment.status?.toUpperCase();
  if (status !== 'CONFIRMED' && status !== 'PENDING') return false;
  
  const startTime = new Date(appointment.startTime);
  const now = new Date();
  const diffInHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffInHours >= 2;
};

export const isAppointmentPending = (appointment: any) => {
  return appointment?.status?.toUpperCase() === 'PENDING';
};

export const isAppointmentConfirmed = (appointment: any) => {
  return appointment?.status?.toUpperCase() === 'CONFIRMED';
};
