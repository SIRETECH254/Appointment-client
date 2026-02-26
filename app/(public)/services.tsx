/**
 * Services Page
 * 
 * This page displays all available services with search, filtering, and service cards.
 * Users can browse services, search by name/description, filter by status, and navigate
 * to book appointments or make service payments.
 * 
 * Features:
 * - Search services by name or description (with debouncing)
 * - Filter services by status (All, Active, Inactive)
 * - Display services in cards with details (name, description, duration, price, deposit)
 * - Pull-to-refresh functionality
 * - Loading and empty states
 * - Service payment button (for authenticated users)
 * - Navigation to appointment creation
 * 
 * @component
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// TanStack Query hook for fetching services
import { useGetAllServices } from '@/tanstack/useServices';

// Utility functions for formatting
import { formatCurrency } from '@/utils/paymentUtils';
import { formatDuration } from '@/utils/serviceUtils';

// Auth context for checking authentication status
import { useAuth } from '@/contexts/AuthContext';

// Type definitions
import type { IService } from '@/types/api.types';

// ServiceCard component for displaying individual services
import ServiceCard from '@/components/ui/ServiceCard';

/**
 * ServicesPage Component
 * 
 * Main component for the services listing page. Handles:
 * - Service data fetching with TanStack Query
 * - Search functionality with debouncing
 * - Status filtering
 * - Navigation to appointment creation and service payment
 */
export default function ServicesPage() {
  const router = useRouter();
  
  // Auth context to check if user is authenticated
  // This is used to conditionally show the service payment button
  const { isAuthenticated } = useAuth();

  // Local state for search functionality
  // searchTerm: Current value in the search input
  // debouncedSearch: Debounced version used for API calls (reduces API requests)
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  /**
   * Debounce search input to reduce API calls
   * Updates debouncedSearch 500ms after user stops typing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    // Cleanup: Clear timeout if searchTerm changes before 500ms
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /**
   * Prepare query parameters for the API call
   * Only active services are fetched (no status filter needed)
   * This ensures the query only refetches when search value changes
   */
  const params = useMemo(() => ({
    search: debouncedSearch || undefined, // Only include search if it has a value
    status: 'active' as const, // Always fetch only active services
  }), [debouncedSearch]);

  /**
   * Fetch services using TanStack Query hook
   * - isLoading: True during initial fetch
   * - isFetching: True during any fetch (including refetch)
   * - data: Array of services or undefined
   * - error: Error object if fetch fails
   * - refetch: Function to manually refetch data
   */
  const { data: servicesData, isLoading, isFetching, error, refetch } = useGetAllServices(params);

  /**
   * Extract services array from the response
   * The API may return { services: IService[] } or IService[] directly
   * This handles both cases safely
   */
  const services: IService[] = useMemo(() => {
    if (!servicesData) return [];
    
    // Check if data is an array directly
    if (Array.isArray(servicesData)) {
      return servicesData;
    }
    
    // Check if data has a services property
    if (servicesData && typeof servicesData === 'object' && 'services' in servicesData) {
      return (servicesData as any).services || [];
    }
    
    return [];
  }, [servicesData]);

  /**
   * Handle service payment button press
   * Checks authentication status and navigates accordingly:
   * - If authenticated: Navigate to service payment page
   * - If not authenticated: Redirect to login page
   */
  const handleServicePaymentPress = useCallback(() => {
    if (isAuthenticated) {
      // User is authenticated, navigate to service payment page
      router.push('/(authenticated)/payments/service');
    } else {
      // User is not authenticated, redirect to login page
      router.push('/(public)/(auth)/login');
    }
  }, [isAuthenticated, router]);

  /**
   * Handle service card press
   * Navigates to appointment creation with the selected service
   * Checks authentication first - redirects to login if not authenticated
   * This allows users to quickly book an appointment for a specific service
   */
  const handleServiceCardPress = useCallback((service: IService) => {
    if (isAuthenticated) {
      // User is authenticated, navigate to appointment creation page
      // The service can be passed via route params or state if needed
      router.push('/(authenticated)/appointment/create');
    } else {
      // User is not authenticated, redirect to login page
      router.push('/(public)/(auth)/login');
    }
  }, [isAuthenticated, router]);

  /**
   * Handle "Book Now" button press on service card
   * Same as handleServiceCardPress but specifically for the button action
   */
  const handleBookNowPress = useCallback((service: IService) => {
    handleServiceCardPress(service);
  }, [handleServiceCardPress]);


  /**
   * Render skeleton loading cards
   * Shows 5 animated skeleton cards with animate-pulse class while data is loading
   */
  const renderSkeletonCards = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <View
        key={`skeleton-${index}`}
        className="mb-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse"
      >
        {/* Service Name Skeleton */}
        <View className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
        
        {/* Description Skeleton */}
        <View className="mb-1 h-4 w-full rounded bg-gray-200" />
        <View className="mb-4 h-4 w-5/6 rounded bg-gray-200" />
        
        {/* Details Row Skeleton */}
        <View className="mb-4 flex-row items-center justify-between">
          <View className="h-4 w-20 rounded bg-gray-200" />
          <View className="h-5 w-24 rounded bg-gray-200" />
        </View>
        
        {/* Button Skeleton */}
        <View className="h-10 w-full rounded-xl bg-gray-200" />
      </View>
    ));
  };

  /**
   * Render empty state when no services are found
   * Provides helpful feedback to users when search returns no results
   */
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <MaterialIcons name="spa" size={40} color="#9CA3AF" />
      </View>
      <Text className="mt-4 text-lg font-bold text-gray-900">No services found</Text>
      <Text className="mt-1 text-center text-gray-500">
        {searchTerm
          ? 'Try adjusting your search'
          : 'No services are currently available'}
        </Text>
    </View>
  );

  /**
   * Render skeleton loading state during initial fetch
   * Shows 5 animated skeleton cards with pulse animation
   */
  if (isLoading && !isFetching) {
    return (
      <View className="flex-1 bg-gray-50">
        <Stack.Screen
          options={{
            title: 'Our Services',
            headerShown: true,
          }}
        />
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderSkeletonCards()}
        </ScrollView>
      </View>
    );
  }

  /**
   * Render error state if API call fails
   * Displays error message with retry option
   */
  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <Stack.Screen
          options={{
            title: 'Our Services',
            headerShown: true,
          }}
        />
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className="mt-4 text-center text-lg font-bold text-gray-900">
            Error loading services
        </Text>
          <Text className="mt-2 text-center text-gray-500">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="btn-primary mt-6"
          >
            <Text className="font-inter text-base font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * Main render: Services listing page
   * Includes header, search bar, filters, service list, and FAB
   */
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Configuration */}
      <Stack.Screen
        options={{
          title: 'Our Services',
          headerShown: true,
          // Add service payment button to header if authenticated
          headerRight: () => (
            isAuthenticated ? (
              <TouchableOpacity
                onPress={handleServicePaymentPress}
                className="mr-4 flex-row items-center rounded-lg bg-brand-primary px-3 py-2"
              >
                <MaterialIcons name="payment" size={18} color="white" />
                <Text className="ml-1 font-inter text-sm font-semibold text-white">
                  Pay
                </Text>
              </TouchableOpacity>
            ) : null
          ),
        }}
      />

      {/* Search Section */}
      <View className="border-b border-gray-100 bg-white px-4 pb-4 pt-2">
        {/* Search Input */}
        <View className="relative">
          {/* Search Icon */}
          <View className="absolute left-3 top-3 z-10">
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
          </View>

          {/* Search Input Field */}
          <TextInput
            placeholder="Search services by name or description..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="input-search bg-gray-50"
            placeholderTextColor="#9CA3AF"
          />

          {/* Clear Button (shown when search has text) */}
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchTerm('')}
              className="absolute right-3 top-3 z-10"
            >
              <MaterialIcons name="cancel" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Services List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={['#D4AF37']}
            tintColor="#D4AF37"
          />
        }
      >
        {isFetching && !isLoading ? (
          // Show skeleton cards while fetching/refreshing
          renderSkeletonCards()
        ) : services.length === 0 ? (
          // Show empty state when no services
          renderEmptyState()
        ) : (
          // Render services using map
          services.map((service) => (
            <View key={service._id} className="mb-4">
              <ServiceCard
                service={service}
                onPress={() => handleServiceCardPress(service)}
                showBookButton={true}
                onBookPress={() => handleBookNowPress(service)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button: Service Payment (shown when authenticated) */}
      {isAuthenticated && (
        <TouchableOpacity
          onPress={handleServicePaymentPress}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-brand-primary shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <MaterialIcons name="payment" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
