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
- **Local State:**
  - `activeTab`: 'staff' | 'services' | 'slots' | 'summary'.
  - `selectedStaff`: User object or ID.
  - `selectedServices`: Array of service IDs.
  - `selectedDate`: Date object.
  - `selectedSlot`: Slot object (startTime, endTime).
  - `notes`: String.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Create Appointment           │
├────────────────────────────────────────────┤
│  [ Staff ] [ Services ] [ Slots ] [ Sum ]  │ (Tab Bar)
├────────────────────────────────────────────┤
│                                            │
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
│ │ Services: Haircut, Coloring, Styling   │ │
│ │ [ Select ]                             │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ (Avatar)  John Doe                     │ │
│ │ Roles: Barber                          │ │
│ │ Services: Beard Trim, Shave            │ │
│ │ [ Select ]                             │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

### Tab 2: Select Services
```
┌────────────────────────────────────────────┐
│ ✂️ Select Services                          │
├────────────────────────────────────────────┤
│ 🔘 Haircut (Autoselected)                  │
│ 🔘 Coloring (Autoselected)                 │
│ ⚪ Massage (Disabled - Not offered by Jane)│
│ ⚪ Shave (Disabled - Not offered by Jane)  │
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
│  Date: [ 2025-02-25 ]  (Picker Trigger)    │
├────────────────────────────────────────────┤
│ Available Slots for Jane Smith:            │
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
│ Staff: Jane Smith                          │
│ Services: Haircut, Coloring                │
│ Date: Feb 25, 2025                         │
│ Time: 09:00 AM - 10:30 AM                  │
├────────────────────────────────────────────┤
│ Notes: [ Please use organic products... ]  │
├────────────────────────────────────────────┤
│ [ CONFIRM & BOOK ]                         │
└────────────────────────────────────────────┘
```

## Functions Involved

### `handleConfirmDate(date)`
Updates `selectedDate` and resets the selected slot.
```tsx
const handleConfirmDate = (date: Date) => {
  setSelectedDate(date);
  setSelectedSlot(null);
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
Updates `selectedStaff` and automatically populates `selectedServices` with all services provided by that staff member.
```tsx
const handleStaffSelect = (staff) => {
  setSelectedStaff(staff);
  // Autoselect services provided by this staff
  const staffServiceIds = staff.services.map(s => s._id);
  setSelectedServices(staffServiceIds);
  setActiveTab('services');
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

### `fetchAvailability()`
The query key for `useGetSlots` ensures availability is updated when any core dependency changes.
```tsx
const { data: slots } = useGetSlots({
  staffId: selectedStaff?._id,
  serviceIds: selectedServices, // Array passed to query
  date: format(selectedDate, 'yyyy-MM-dd')
});
```

### `handleBooking()`
Triggers the `useCreateAppointment` mutation.
```tsx
const handleBooking = async () => {
  await createMutation.mutateAsync({
    staffId: selectedStaff._id,
    services: selectedServices,
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
    notes
  });
};
```

## API Integration
- **Slots Query:** `GET /api/availability/slots?staffId=...&serviceIds=...&date=...`.
- **Create Mutation:** `POST /api/appointments`.
