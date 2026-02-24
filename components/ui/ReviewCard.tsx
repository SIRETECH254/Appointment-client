// appointment-client/components/ui/ReviewCard.tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ReviewCardProps {
  review: {
    id: string;
    avatar: string;
    customerName: string;
    rating: number;
    comment: string;
    timeAgo: string;
  };
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <MaterialIcons
        key={i}
        name={i <= rating ? 'star' : 'star-border'}
        size={20}
        color={i <= rating ? '#FFD700' : '#C0C0C0'} // Gold for filled, silver for border
      />
    );
  }
  return <View className="flex-row">{stars}</View>;
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <View className="bg-white rounded-lg shadow-md p-4 m-2" style={{ width: 300 }}>
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: review.avatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="font-bold text-lg">{review.customerName}</Text>
          <StarRating rating={review.rating} />
        </View>
      </View>
      <Text className="text-gray-700 text-base mb-3">{review.comment}</Text>
      <Text className="text-gray-500 text-xs text-right">{review.timeAgo}</Text>
    </View>
  );
};

export default ReviewCard;
