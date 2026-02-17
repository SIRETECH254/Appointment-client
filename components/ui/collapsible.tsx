import { PropsWithChildren, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native'; // Added Text, View, removed ThemedText, ThemedView imports

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
        className="flex-row items-center gap-2"
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={iconColor} // Adjusted color usage
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text className="font-inter text-base font-semibold">{title}</Text> {/* Replaced ThemedText with Text and applied styles */}
      </TouchableOpacity>
      {isOpen && <View className="mt-2 ml-6">{children}</View>} {/* Replaced ThemedView with View */}
    </View>
  );
}
