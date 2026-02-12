import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native'; // Added Text, View imports

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text'; // Removed
// import { ThemedView } from '@/components/themed-view'; // Removed
import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Fonts } from '@/constants/theme'; // Removed

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <View style={styles.titleContainer}> {/* Replaced ThemedView with View */}
        <Text
          style={[
            styles.title, // Applied title style
            // { fontFamily: Fonts.rounded }, // Removed fontFamily usage
          ]}>
          Explore
        </Text>
      </View>
      <Text style={styles.defaultText}>This app includes example code to help you get started.</Text> {/* Replaced ThemedText with Text */}
      <Text className="text-blue-500 text-xl font-bold mt-4 underline ">Tailwind CSS is working!</Text>
      <Collapsible title="File-based routing">
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          This app has two screens:{' '}
          <Text style={styles.defaultSemiBold}>app/(tabs)/index.tsx</Text> and{' '} {/* Replaced ThemedText with Text */}
          <Text style={styles.defaultSemiBold}>app/(tabs)/explore.tsx</Text> {/* Replaced ThemedText with Text */}
        </Text>
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          The layout file in <Text style={styles.defaultSemiBold}>app/(tabs)/_layout.tsx</Text>{' '} {/* Replaced ThemedText with Text */}
          sets up the tab navigator.
        </Text>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <Text style={styles.linkText}>Learn more</Text> {/* Replaced ThemedText with Text and applied link style */}
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <Text style={styles.defaultSemiBold}>w</Text> in the terminal running this project. {/* Replaced ThemedText with Text */}
        </Text>
      </Collapsible>
      <Collapsible title="Images">
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          For static images, you can use the <Text style={styles.defaultSemiBold}>@2x</Text> and{' '} {/* Replaced ThemedText with Text */}
          <Text style={styles.defaultSemiBold}>@3x</Text> suffixes to provide files for {/* Replaced ThemedText with Text */}
          different screen densities
        </Text>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <Text style={styles.linkText}>Learn more</Text> {/* Replaced ThemedText with Text and applied link style */}
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          This template has light and dark mode support. The{' '}
          <Text style={styles.defaultSemiBold}>useColorScheme()</Text> hook lets you inspect {/* Replaced ThemedText with Text */}
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </Text>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <Text style={styles.linkText}>Learn more</Text> {/* Replaced ThemedText with Text and applied link style */}
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          This template includes an example of an animated component. The{' '}
          <Text style={styles.defaultSemiBold}>components/HelloWave.tsx</Text> component uses {/* Replaced ThemedText with Text */}
          the powerful{' '}
          <Text style={[styles.defaultSemiBold /* Removed fontFamily: Fonts.mono */]}> {/* Replaced ThemedText with Text and applied styles */}
            react-native-reanimated
          </Text>{' '}
          library to create a waving hand animation.
        </Text>
        {Platform.select({
          ios: (
            <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
              The <Text style={styles.defaultSemiBold}>components/ParallaxScrollView.tsx</Text>{' '} {/* Replaced ThemedText with Text */}
              component provides a parallax effect for the header image.
            </Text>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  // Added styles from themed-text.tsx for direct use
  defaultText: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: { // Assuming this was used if not using ThemedText type="subtitle"
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkText: { // Renamed from 'link' to avoid conflict with 'link' style in main stylesheet
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
