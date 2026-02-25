/**
 * Service Utility Functions
 * 
 * This module contains utility functions for formatting and processing service-related data.
 */

/**
 * Formats duration in minutes to a human-readable string.
 * 
 * @param duration - Duration in minutes (e.g., 30, 90, 120)
 * @returns Formatted duration string (e.g., "30 mins", "1.5 hours", "2 hours")
 * 
 * @example
 * formatDuration(30) // Returns "30 mins"
 * formatDuration(90) // Returns "1.5 hours"
 * formatDuration(120) // Returns "2 hours"
 */
export const formatDuration = (duration: number | undefined): string => {
  if (!duration || duration <= 0) return '0 mins';
  
  // If duration is less than 60 minutes, display in minutes
  if (duration < 60) {
    return `${duration} ${duration === 1 ? 'min' : 'mins'}`;
  }
  
  // Convert to hours for durations >= 60 minutes
  const hours = duration / 60;
  
  // If it's a whole number of hours, display without decimals
  if (hours % 1 === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  // Otherwise, display with one decimal place
  return `${hours.toFixed(1)} hours`;
};

/**
 * Formats service status for display.
 * 
 * @param isActive - Boolean indicating if service is active
 * @returns Formatted status string
 */
export const formatServiceStatus = (isActive: boolean | undefined): string => {
  if (isActive === undefined) return 'Unknown';
  return isActive ? 'Active' : 'Inactive';
};

/**
 * Gets the CSS class variant for service status badge.
 * 
 * @param isActive - Boolean indicating if service is active
 * @returns Badge variant class name
 */
export const getServiceStatusVariant = (isActive: boolean | undefined): string => {
  if (isActive === undefined) return 'badge-soft';
  return isActive ? 'badge-success' : 'badge-error';
};
