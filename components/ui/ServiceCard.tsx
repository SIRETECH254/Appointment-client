// appointment-client/components/ui/ServiceCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Service } from '../../types/api.types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md mb-4">
      <Text className="text-lg font-bold mb-2">{service.name}</Text>
      <Text className="text-gray-600 mb-2">{service.description}</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-800">{service.duration} minutes</Text>
        <Text className="text-lg font-bold">${service.fullPrice}</Text>
      </View>
    </View>
  );
};

export default ServiceCard;
