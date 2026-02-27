# Create Appointment Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Tabbed Navigation Flow](#tabbed-navigation-flow)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Details by Tab](#form-details-by-tab)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)

## Imports
```tsx
import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates'; 
import { useRouter, Stack } from 'expo-router';
import { useCreateAppointment } from '@/tanstack/useAppointments';
import { useGetServices } from '@/tanstack/useServices';
import { useGetStaff } from '@/tanstack/useUsers';
import { useGetSlots } from '@/tanstack/useAvailability';
import { Card, Button, Badge, Loading } from '@/components/ui';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```


## Context and State Management
- **TanStack Query:**
  - `useGetAllServices()` - Fetches all available services
  - `useGetAllStaff()` - Fetches all staff members
  - `useGetSlots()` - Fetches available time slots (only when `shouldFetchSlots` is true)
  - `useCreateAppointment()` - Mutation for creating appointment
- **Local State:**
  - `activeTab`: 'staff' | 'services' | 'slots' | 'summary'.
  - `selectedStaff`: User object or null.
  - `selectedServices`: Array of service IDs.
  - `selectedDate`: Date object or null (starts as null, no auto-selection).
  - `selectedSlot`: Slot object (startTime, endTime) or null.
  - `notes`: String.
  - `showDatePicker`: Boolean for date picker modal visibility.
  - `shouldFetchSlots`: Boolean to control when slots are fetched (only after clicking "Check Availability").
  - `errorMessage`: String for tab-specific error messages.

**`useCreateAppointment` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: CreateAppointmentPayload) => {
      const response = await appointmentAPI.create(appointmentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      console.log('Appointment created successfully');
    },
    onError: (error: any) => {
      console.error('Create appointment error:', error);
    },
  });
};
```

**`useGetSlots` hook (from `tanstack/useAvailability.ts`):**
```tsx
export const useGetSlots = (params: GetSlotsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: async () => {
      const response = await availabilityAPI.getSlots(params);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!params.staffId && !!params.date,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
```

## UI Structure
- **Header:** Step indicator with numbered circles (1-4), progress bar, and "Step X of 4" in header right
- **Tabbed Navigation Flow:** Select Staff -> Select Services -> Slot Availability -> Summary
- **Loading States:** Skeleton loaders with `animate-pulse` for staff (5 cards) and services (5 cards)
- **Summary Cards:** Separate cards for each selection (Staff, Services, Date/Time, Price) with edit icons that navigate back to respective tabs
- **Error Display:** Tab-specific error messages displayed in red box below header, only shown when clicking "Next" without selection

## Tabbed Navigation Flow
The appointment creation follows a 4-step process:
1. **Staff Selection:** User selects a professional, services are auto-selected but user stays on tab
2. **Service Selection:** User can modify selected services, must click "Next" to proceed
3. **Slot Selection:** User selects date, clicks "Check Availability", then selects a time slot
4. **Summary:** Review all selections with edit capability, then book appointment

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Create Appointment  Step 1/4│
├────────────────────────────────────────────┤
│  [1]  [2]  [3]  [4]                        │ (Step Indicators)
│  Staff Service Slots Summary               │
│  ────────────────────────                  │ (Progress Bar)
├────────────────────────────────────────────┤
│                                            │
│             TAB CONTENT AREA               │
│        (Scrollable form elements)          │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│ [ < Previous ]                [ Next > ]   │ (Navigation)
└────────────────────────────────────────────┘
```

## Sketch Wireframe

### Tab 1: Select Staff
```
┌────────────────────────────────────────────┐
│ 👤 Select Professional                     │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ (Avatar)  Jane Smith                   │ │
│ │ Roles: Senior Stylist                  │ │
│ │ Services Provided:                     │ │
│ │ • Haircut                              │ │
│ │ • Coloring                             │ │
│ │ • Styling                              │ │
│ │ [ ✓ Selected ]                         │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ (Avatar)  John Doe                     │ │
│ │ Roles: Barber                          │ │
│ │ Services Provided:                     │ │
│ │ • Beard Trim                           │ │
│ │ • Shave                                │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ [Loading: 5 skeleton cards with animate-  │
│  pulse while fetching staff]               │
└────────────────────────────────────────────┘
```

### Tab 2: Select Services
```
┌────────────────────────────────────────────┐
│ ✂️ Select Services                          │
├────────────────────────────────────────────┤
│ [Loading: 5 skeleton cards with animate-  │
│  pulse while fetching services]            │
│                                            │
│ ☑ Haircut (Autoselected)                  │
│ ☑ Coloring (Autoselected)                 │
│ ☐ Massage (Disabled - Not offered by Jane) │
│ ☐ Shave (Disabled - Not offered by Jane)  │
├────────────────────────────────────────────┤
│ Total Duration: 90 mins                    │
│ Total Price: KES 2,500                     │
└────────────────────────────────────────────┘
```

### Tab 3: Slot Availability
```
┌────────────────────────────────────────────┐
│ 📅 Select Date & Time                      │
├────────────────────────────────────────────┤
│  Date: [ Select a date ]  (Picker Trigger) │
│                                            │
│  [ Check Availability ] (Disabled until   │
│                          date selected)    │
├────────────────────────────────────────────┤
│ (Slots only shown after clicking button)   │
│                                            │
│ Available Slots for Jane Smith:            │
│ [Message: "No working hours for this day"] │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ 09:00 AM│ │ 10:30 AM│ │ 01:00 PM│        │
│ └─────────┘ └─────────┘ └─────────┘        │
└────────────────────────────────────────────┘
```

### Tab 4: Summary
```
┌────────────────────────────────────────────┐
│ 📋 Review Appointment                      │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ 👤 Staff                    [Edit]      │ │
│ │ (Avatar) Jane Smith                    │ │
│ │ Senior Stylist                          │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ ✂️ Services                 [Edit]      │ │
│ │ 1. Haircut - KES 1,500                 │ │
│ │ 2. Coloring - KES 1,000                │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ ⏰ Date & Time              [Edit]      │ │
│ │ Date: February 25, 2025                │ │
│ │ Start: 9:00 AM                         │ │
│ │ End: 10:30 AM                          │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ 💰 Price Summary                       │ │
│ │ Total Duration: 90 mins                │ │
│ │ Total Price: KES 2,500                 │ │
│ └────────────────────────────────────────┘ │
│ Notes: [ Please use organic products... ]  │
├────────────────────────────────────────────┤
│ [ BOOK ]                                   │
└────────────────────────────────────────────┘
```

## Functions Involved

### `handleConfirmDate(date)`
Updates `selectedDate` and resets the selected slot and fetch flag. Does NOT automatically fetch slots.
```tsx
const handleConfirmDate = (date: Date) => {
  setSelectedDate(date);
  setSelectedSlot(null);
  setShouldFetchSlots(false); // Reset fetch flag when date changes
  setShowDatePicker(false);
};
```

### `hideDatePicker()`
Closes the date picker modal.
```tsx
const hideDatePicker = () => {
  setShowDatePicker(false);
};
```

### `handleStaffSelect(staff)`
Updates `selectedStaff` and automatically populates `selectedServices` with all services provided by that staff member. Note: Does NOT automatically navigate to next tab - user must click "Next" button.
```tsx
const handleStaffSelect = (staff) => {
  setSelectedStaff(staff);
  // Autoselect services provided by this staff
  const staffServiceIds = staff.services.map(s => s._id);
  setSelectedServices(staffServiceIds);
  setSelectedSlot(null); // Reset slot if staff changes
  setSelectedDate(null); // Reset date
  setShouldFetchSlots(false); // Reset fetch flag
  // User must click "Next" to proceed
};
```

### `isServiceDisabled(serviceId)`
Logic to determine if a service should be disabled based on the selected staff's capabilities.
```tsx
const isServiceDisabled = (serviceId) => {
  if (!selectedStaff) return false;
  return !selectedStaff.services.some(s => s._id === serviceId);
};
```

### `calculateTotals()`
Computes the total price and duration for the summary tab.
```tsx
const totals = useMemo(() => {
  return selectedServices.reduce((acc, id) => {
    const service = allServices.find(s => s._id === id);
    return {
      price: acc.price + (service?.price || 0),
      duration: acc.duration + (service?.duration || 0)
    };
  }, { price: 0, duration: 0 });
}, [selectedServices]);
```

### `handleCheckAvailability()`
Manually triggers slot fetching when user clicks "Check Availability" button. Slots are NOT automatically fetched when date is selected.
```tsx
const handleCheckAvailability = () => {
  if (!selectedDate) {
    setErrorMessage('Please select a date first.');
    return;
  }
  setShouldFetchSlots(true);
  setSelectedSlot(null); // Reset selected slot
  refetchSlots();
};
```

### `fetchAvailability()`
The query for `useGetSlots` only runs when `shouldFetchSlots` is true and all required params are available. Slots are NOT automatically fetched on date selection.
```tsx
const { data: slotsData, isLoading: isLoadingSlots, refetch: refetchSlots } = useGetSlots(slotsParams, {
  enabled: shouldFetchSlots && !!slotsParams,
});
const slots = slotsData?.slots || [];
// API messages are displayed: slotsData?.message
```

### `handleBooking()`
Triggers the `useCreateAppointment` mutation with validation and navigation.
```tsx
const handleBooking = async () => {
  if (!selectedStaff || selectedServices.length === 0 || !selectedSlot) {
    Alert.alert('Error', 'Please complete all steps before booking.');
    return;
  }

  try {
    await createMutation.mutateAsync({
      staffId: selectedStaff._id,
      services: selectedServices,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      notes,
    });
    Toast.show({
      type: 'success',
      text1: 'Success!',
      text2: 'Appointment booked successfully',
      position: 'top',
    });
    router.push('/(authenticated)/appointment');
  } catch {
    // Error handled by mutation
  }
};
```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `appointmentAPI.create` and `availabilityAPI.getSlots`.
- **Slots Query Endpoint:** `GET /api/availability/slots` with query parameters.
- **Query Parameters:**
  - `staffId` - Required staff member ID
  - `serviceIds` - Array of service IDs (comma-separated or array)
  - `date` - Date string in ISO format (YYYY-MM-DD)
- **Slots Response Structure:**
  ```json
  {
    "success": true,
    "data": {
      "slots": [
        {
          "startTime": "2026-02-01T09:00:00.000Z",
          "endTime": "2026-02-01T10:00:00.000Z",
          "available": true
        }
      ],
      "message": "Available slots retrieved successfully"
    }
  }
  ```
- **Create Mutation Endpoint:** `POST /api/appointments`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Create Payload:**
  ```json
  {
    "staffId": "...",
    "services": ["serviceId1", "serviceId2"],
    "startTime": "2026-02-01T09:00:00.000Z",
    "endTime": "2026-02-01T10:00:00.000Z",
    "notes": "Optional notes"
  }
  ```
- **Create Response Structure:**
  ```json
  {
    "success": true,
    "message": "Appointment created successfully",
    "data": {
      "appointment": {
        "_id": "...",
        "status": "PENDING",
        "bookingFeeAmount": 500,
        "remainingAmount": 1000
      }
    }
  }
  ```
- **Cache invalidation:** After successful creation, queries for `['appointments']` and `['appointments', 'my']` are invalidated.
