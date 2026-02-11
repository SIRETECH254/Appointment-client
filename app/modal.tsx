import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native'; // Added Text, View

// import { ThemedText } from '@/components/themed-text'; // Removed
// import { ThemedView } from '@/components/themed-view'; // Removed

export default function ModalScreen() {
  return (
    <View style={styles.container}> {/* Replaced ThemedView with View */}
      <Text style={styles.title}>This is a modal</Text> {/* Replaced ThemedText with Text and applied title style */}
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text> {/* Replaced ThemedText with Text and applied link style */}
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: { // Added title style
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: { // Added linkText style
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
