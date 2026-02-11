import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View } from 'react-native'; // Added Text, View imports

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text'; // Removed
// import { ThemedView } from '@/components/themed-view'; // Removed
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <View style={styles.titleContainer}> {/* Replaced ThemedView with View */}
        <Text style={styles.title}>Welcome!</Text> {/* Replaced ThemedText with Text and applied title style */}
        <HelloWave />
      </View>
      <View style={styles.stepContainer}> {/* Replaced ThemedView with View */}
        <Text style={styles.subtitle}>Step 1: Try it</Text> {/* Replaced ThemedText with Text and applied subtitle style */}
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          Edit <Text style={styles.defaultSemiBold}>app/(tabs)/index.tsx</Text> to see changes. {/* Replaced ThemedText with Text */}
          Press{' '}
          <Text style={styles.defaultSemiBold}> {/* Replaced ThemedText with Text */}
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </Text>{' '}
          to open developer tools.
        </Text>
      </View>
      <View style={styles.stepContainer}> {/* Replaced ThemedView with View */}
        <Link href="/modal">
          <Link.Trigger>
            <Text style={styles.subtitle}>Step 2: Explore</Text> {/* Replaced ThemedText with Text and applied subtitle style */}
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </View>
      <View style={styles.stepContainer}> {/* Replaced ThemedView with View */}
        <Text style={styles.subtitle}>Step 3: Get a fresh start</Text> {/* Replaced ThemedText with Text and applied subtitle style */}
        <Text style={styles.defaultText}> {/* Replaced ThemedText with Text */}
          {`When you're ready, run `}
          <Text style={styles.defaultSemiBold}>npm run reset-project</Text> to get a fresh{' '} {/* Replaced ThemedText with Text */}
          <Text style={styles.defaultSemiBold}>app</Text> directory. This will move the current{' '} {/* Replaced ThemedText with Text */}
          <Text style={styles.defaultSemiBold}>app</Text> to{' '} {/* Replaced ThemedText with Text */}
          <Text style={styles.defaultSemiBold}>app-example</Text>. {/* Replaced ThemedText with Text */}
        </Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
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
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
