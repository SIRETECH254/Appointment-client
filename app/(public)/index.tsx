import { ImageBackground, Text, View, useWindowDimensions, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router'; // Import Link
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; // Import MaterialIcons for icons

// Import Tanstack Query hooks
import { useGetAllServices } from '../../tanstack/useServices'; 

// Import custom UI components
import ServiceCard from '../../components/ui/ServiceCard'; 
import ServiceCardSkeleton from '../../components/ui/ServiceCardSkeleton'; 

// Import types
import { Service } from '../../types/api.types'; 

export default function HomePage() {
  // Get window dimensions for responsive design
  const { width, height } = useWindowDimensions();
  // Fetch services data, loading state, and error using Tanstack Query
  const { data: services, isLoading, error } = useGetAllServices(); 

  // Dynamically calculate hero section height based on screen width
  const getHeroHeight = () => {
    if (width < 640) { // Small screens
      return height * 0.5;
    } else if (width < 1024) { // Medium screens
      return height * 0.6;
    } else { // Large screens
      return height * 0.7;
    }
  };

  const heroHeight = getHeroHeight();

  return (
    // Main scrollable container for the entire page
    <ScrollView className="flex-1">
      
      {/* Hero Section: Background image and overlay content */}
      <ImageBackground
        source={require('../../assets/images/Hero-Background.jpeg')}
        resizeMode="cover"
        style={{
          width: '100%',
          height: heroHeight,
        }}
        className="relative " // Positioning for absolute overlay
      >
        {/* Dark overlay for better text readability */}
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

        {/* Hero content: Titles, description, and action buttons */}
        <View className="p-4 sm:p-6 md:p-8 lg:p-12 w-full"> 

          {/* Main title part 1 */}
          <Text className="text-white text-4xl md:text-6xl font-bold mb-5">Precision Meet</Text>

          {/* Main title part 2 (accent color) */}
          <Text className="text-brand-primary font-bold text-4xl md:text-6xl mb-5 ">Pure Indulgence.</Text>
          
          {/* Hero description text */}
          <Text className="text-white text-sm md:text-lg font-semibold mb-4 md:mb-6 max-w-2xl">
            Your journey to ultimate relaxation and profound rejuvenation begins here. Immerse yourself in a sanctuary of tranquility, where our expert therapists offer a curated selection of bespoke treatments meticulously tailored to your unique needs and desires for a truly transformative well-being experience.
          </Text>
                    
          {/* Buttons Section: Call to action buttons */}
          <View className="space-y-3 gap-x-3 sm:flex sm:flex-row mt-4 items-center">

            {/* "Book your experience" button */}
            <Link href="/appointment/create" asChild>
              <TouchableOpacity className="bg-white py-2 px-4 rounded-full flex-row items-center">
                <Text className="text-brand-primary font-semibold text-lg">Book your experience <MaterialIcons name='arrow-forward' size={20}/> </Text>
              </TouchableOpacity>
            </Link>

            {/* "Explore services" button */}
            <Link href="/services" asChild>
              <TouchableOpacity className="bg-transparent border-2 border-white py-2 px-4 rounded-full">
                <Text className="text-white font-semibold text-lg">Explore services</Text>
              </TouchableOpacity>
            </Link>

          </View>

        </View>
      </ImageBackground>

      {/* Services Section: Displays available services */}
      <View className="p-4 bg-gray-50 flex-1">
        {/* Section title */}
        <Text className="text-3xl font-bold mb-6 text-center text-brand-primary">Our Services</Text>

        {/* Loading state: Display skeleton cards while services are being fetched */}
        {isLoading && (
          <View className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <View key={i} className="col-span-1 p-2">
                <ServiceCardSkeleton />
              </View>
            ))}
          </View>
        )}

        {/* Error state: Display error message if fetching services fails */}
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

        {/* Services available state: Display up to 6 service cards and "View All" button */}
        {!isLoading && !error && services && services.length > 0 && (
          <View>
            {/* Grid for displaying service cards */}
            <View className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-2">
              {services.slice(0, 6).map((service: Service) => (
                // Individual service card
                <View key={service._id} className="col-span-1 p-2">
                  <ServiceCard service={service} />
                </View>
              ))}
            </View>
            {/* "View All Services" button, visible if more than 6 services exist */}
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
      
      {/* Call to Action Section: Prompts user to book an appointment */}
      <View className="bg-brand-primary  p-8 items-center justify-center space-y-4">
        {/* CTA title */}
        <Text className="text-white text-3xl font-bold text-center">Ready for Your Next Experience?</Text>
        {/* CTA description */}
        <Text className="text-white text-lg text-center max-w-xl">
          Don't wait to treat yourself. Book your personalized appointment today and embark on a journey of relaxation and wellness.
        </Text>
        {/* CTA button to book appointment */}
        <Link href="/appointment/create" asChild>
          <TouchableOpacity className="bg-white py-3 px-8 rounded-full shadow-lg">
            <Text className="text-brand-primary font-bold text-lg">Book Your Appointment Now</Text>
          </TouchableOpacity>
        </Link>
      </View>

    </ScrollView>
  );
}
