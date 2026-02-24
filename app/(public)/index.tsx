import { ImageBackground, Text, View, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router'; // Import Link
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetAllServices } from '../../tanstack/useServices'; // Import useGetAllServices
import ServiceCard from '../../components/ui/ServiceCard'; // Import ServiceCard
import ServiceCardSkeleton from '../../components/ui/ServiceCardSkeleton'; // Import ServiceCardSkeleton
import { Service } from '../../types/api.types'; // Import Service type

export default function HomePage() {
  const { width, height } = useWindowDimensions();
  const { data: services, isLoading, error } = useGetAllServices(); // Fetch services, loading state, and error

  const getHeroHeight = () => {
    if (width < 640) {
      return height * 0.5;
    } else if (width < 1024) {
      return height * 0.6;
    } else {
      return height * 0.7;
    }
  };

  const heroHeight = getHeroHeight();

  return (
    <ScrollView className="flex-1">
      
      {/* Hero section */}
      <ImageBackground
        source={require('../../assets/images/Hero-Background.jpeg')}
        resizeMode="cover"
        style={{
          width: '100%',
          height: heroHeight,
        }}
        className="relative " // Center content vertically and horizontally
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }}
        />

        <View className="p-4 sm:p-6 md:p-8 lg:p-12 w-full"> 

          <Text className="text-white text-4xl md:text-6xl font-bold mb-5">Precision Meet</Text>

          <Text className="text-brand-primary font-bold text-4xl md:text-6xl mb-5 ">Pure Indulgence.</Text>
          
          <Text className="text-white text-sm md:text-lg font-semibold mb-4 md:mb-6 max-w-2xl">
            Your journey to ultimate relaxation and profound rejuvenation begins here. Immerse yourself in a sanctuary of tranquility, where our expert therapists offer a curated selection of bespoke treatments meticulously tailored to your unique needs and desires for a truly transformative well-being experience.
          </Text>
                    
          {/* Buttons Section */}
          <View className="space-y-3 gap-x-3 sm:flex sm:flex-row mt-4 items-center">

            <Link href="/appointment/create" asChild>
              <TouchableOpacity className="bg-white py-2 px-4 rounded-full flex-row items-center">
                <Text className="text-brand-primary font-semibold text-lg">Book your experience <MaterialIcons name='arrow-forward' size={20}/> </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/services" asChild>
              <TouchableOpacity className="bg-transparent border-2 border-white py-2 px-4 rounded-full">
                <Text className="text-white font-semibold text-lg">Explore services</Text>
              </TouchableOpacity>
            </Link>

          </View>

        </View>
      </ImageBackground>

      {/* Services Section */}
      <View className="p-4 bg-gray-50 flex-1">
        <Text className="text-3xl font-bold mb-6 text-center text-brand-primary">Our Services</Text>

        {/* Loading state: Display skeleton cards */}
        {isLoading && (
          <View className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <View key={i} className="col-span-1 p-2">
                <ServiceCardSkeleton />
              </View>
            ))}
          </View>
        )}

        {/* Error state: Display error message */}
        {error && (
          <View className="p-4 flex-col items-center justify-center space-y-3">
            <MaterialIcons name="error-outline" size={48} color="red" />
            <Text className="text-red-500 text-lg text-center">Error fetching services: {error.message}</Text>
            <Text className="text-gray-500 text-sm text-center">Please try again later.</Text>
          </View>
        )}

        {/* No services state: Display message when no services are available */}
        {!isLoading && !error && services && services.length === 0 && (
          <View className="p-4 flex-col items-center justify-center space-y-3">
            <MaterialIcons name="info-outline" size={48} color="gray" />
            <Text className="text-gray-600 text-lg text-center">No services available at the moment.</Text>
            <Text className="text-gray-500 text-sm text-center">Check back soon for new offerings!</Text>
          </View>
        )}

        {/* Services available state: Display service cards and "View All" button */}
        {!isLoading && !error && services && services.length > 0 && (
          <View>
            <View className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-2">
              {services.slice(0, 6).map((service: Service) => (
                <View key={service._id} className="col-span-1 p-2">
                  <ServiceCard service={service} />
                </View>
              ))}
            </View>
            {services.length > 6 && (
              <Link href="/services" asChild>
                <TouchableOpacity className="mt-4 mx-auto bg-brand-primary py-3 px-6 rounded-full">
                  <Text className="text-white font-semibold text-lg text-center">View All Services</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        )}
      </View>
      
    </ScrollView>
  );
}
