import type { PropsWithChildren, ReactElement } from 'react';
import { View } from 'react-native'; // Added View, removed ThemedView
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from 'react-native-reanimated';
import { styled } from 'nativewind';

// import { ThemedView } from '@/components/themed-view'; // Removed
import { useColorScheme } from '@/hooks/use-color-scheme';
// import { useThemeColor } from '@/hooks/use-theme-color'; // Removed

const HEADER_HEIGHT = 250;
const StyledScrollView = styled(Animated.ScrollView);
const StyledAnimatedView = styled(Animated.View);

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  // const backgroundColor = useThemeColor({}, 'background'); // Removed
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <StyledScrollView
      ref={scrollRef}
      className="flex-1 bg-white"
      scrollEventThrottle={16}>
      <StyledAnimatedView
        style={[
          { height: HEADER_HEIGHT, overflow: 'hidden' },
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </StyledAnimatedView>
      <View className="flex-1 gap-4 overflow-hidden p-8">{children}</View> {/* Replaced ThemedView with View */}
    </StyledScrollView>
  );
}
