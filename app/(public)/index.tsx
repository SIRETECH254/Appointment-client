import { ImageBackground, Text, View, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router'; // Import Link

export default function HomePage() {

  const { width, height } = useWindowDimensions();

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
    <View className="flex-1">

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

        <View className="p-4 sm:p-6 md:p-8 lg:p-12"> 
          
          <Text className="text-white text-4xl md:text-6xl font-bold mb-5">Precision Meet</Text>

          <Text className="text-brand-primary font-bold text-4xl md:text-6xl mb-5 ">Pure Indulgence.</Text>
          
          <Text></Text>
          
          {/* Buttons Section */}
          <View className="flex-col gap-3 sm:flex-row mt-6">
            <Link href="/appointment/create" asChild>
              <TouchableOpacity className="bg-white py-2 px-4 rounded-full ">
                <Text className="text-brand-primary font-semibold text-lg">Book your experience</Text>
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
    </View>
  );
}
