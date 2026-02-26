import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type NavItem = {
  label: string;
  path: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  end?: boolean;
  requiresAuth?: boolean;
  isPublic?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', icon: 'home', end: true, isPublic: true },
  { label: 'Services', path: '/(public)/services', icon: 'room-service', end: true, isPublic: true },
  { label: 'Contact', path: '/(public)/contact', icon: 'mail-outline', end: true, isPublic: true },
  { label: 'Appointments', path: '/(authenticated)/appointment', icon: 'calendar-today', end: false, requiresAuth: true },
  { label: 'Payments', path: '/(authenticated)/payments', icon: 'payments', end: true, requiresAuth: true },
  { label: 'Profile', path: '/(authenticated)/profile', icon: 'account-circle', end: true, requiresAuth: true },
];

/**
 * Normalize a path by removing trailing slashes (except for root)
 */
const normalizePath = (path: string): string => {
  if (path === '/' || path === '') return '/';
  return path.replace(/\/+$/, '');
};

/**
 * Extract the actual route path from a pathname that might include route groups
 * e.g., '/(public)/services' -> '/services', '/(authenticated)/appointment' -> '/appointment'
 */
const extractRoutePath = (path: string): string => {
  // Remove route groups like (public) or (authenticated)
  return path.replace(/\/\([^)]+\)/g, '');
};

/**
 * Check if a route is active based on the current pathname
 */
export const isRouteActive = (pathname: string, item: NavItem): boolean => {
  // Normalize both paths for comparison
  const normalizedPathname = normalizePath(pathname);
  const normalizedItemPath = normalizePath(item.path);

  // Extract route paths without route groups for comparison
  const routePathname = extractRoutePath(normalizedPathname);
  const routeItemPath = extractRoutePath(normalizedItemPath);

  if (item.end) {
    // Exact match for routes with end: true
    // Handle special cases for root path
    if (item.path === '/') {
      return normalizedPathname === '/' || 
             normalizedPathname === '/(public)' || 
             normalizedPathname === '/(public)/' ||
             routePathname === '/';
    }
    // Check both with and without route groups
    return normalizedPathname === normalizedItemPath || 
           routePathname === routeItemPath;
  } else {
    // Prefix match for routes with end: false (e.g., /appointment should match /appointment/create)
    return normalizedPathname.startsWith(normalizedItemPath) ||
           routePathname.startsWith(routeItemPath);
  }
};

/**
 * Get public navigation items (visible to all users)
 */
export const getPublicNavItems = (): NavItem[] => {
  return NAV_ITEMS.filter(item => item.isPublic);
};

/**
 * Get authenticated navigation items (visible only to authenticated users)
 */
export const getAuthenticatedNavItems = (): NavItem[] => {
  return NAV_ITEMS.filter(item => item.requiresAuth);
};
