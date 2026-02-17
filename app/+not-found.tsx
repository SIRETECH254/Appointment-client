import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>This screen doesn't exist.</Text>
        <Link href="/(public)/" style={styles.link}>
          <Text style={styles.linkText}>Go to homepage</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 32,
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#D4AF37',
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});
