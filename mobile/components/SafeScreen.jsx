import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import COLORS from '@/constants/colors'

//this component is used to wrap screens to ensure they respect safe area insets to not show the content under notches or status bars
export default function SafeScreen({ children }) { //children prop is a special prop that allows you to pass components as data to other components
  const insets = useSafeAreaInsets();
  return <View style={[styles.container, { paddingTop: insets.top }]}>{children}</View>; //wrap children with a view that applies safe area insets
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  }
})