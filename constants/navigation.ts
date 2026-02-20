import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type NavItem = {
  label: string;
  path: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  end?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/(public)/', icon: 'home', end: true },
  { label: 'Services', path: '/(public)/services', icon: 'room-service', end: true },
  { label: 'Contact', path: '/(public)/contact', icon: 'mail-outline', end: true },
  // Future authenticated routes
  { label: 'Appointments', path: '/(authenticated)/appointment', icon: 'calendar-month', end: true },
  { label: 'Profile', path: '/(authenticated)/profile', icon: 'account-circle', end: true },
];
