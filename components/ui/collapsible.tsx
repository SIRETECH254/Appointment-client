import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Added Text, View, removed ThemedText, ThemedView imports

// import { ThemedText } from '@/components/themed-text'; // Removed
// import { ThemedView } from '@/components/themed-view'; // Removed
import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme'; // Removed
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  const iconColor = theme === 'light' ? '#687076' : '#9BA1A6'; // Fallback to original icon colors from constants/theme.ts

  return (
    <View> {/* Replaced ThemedView with View */}
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={iconColor} // Adjusted color usage
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text style={styles.defaultSemiBold}>{title}</Text> {/* Replaced ThemedText with Text and applied styles */}
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>} {/* Replaced ThemedView with View */}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
  defaultSemiBold: { // Added defaultSemiBold style based on themed-text.tsx
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
});
