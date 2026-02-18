import { format } from 'date-fns';

export const formatDateTime = (dateString: string | Date | undefined) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy');
};

export const formatDateTimeWithTime = (dateString: string | Date | undefined) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'MMM d, yyyy p');
};

export const getCategoryBadgeClass = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'appointment':
      return 'bg-blue-100 text-blue-700';
    case 'payment':
      return 'bg-green-100 text-green-700';
    case 'general':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const getTypeDisplayName = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'in_app':
      return 'In-App';
    case 'email':
      return 'Email';
    case 'sms':
      return 'SMS';
    default:
      return type || 'Unknown';
  }
};
