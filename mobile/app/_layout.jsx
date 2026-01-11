import SafeScreen from "@/components/SafeScreen";
import { HeaderShownContext } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
    </SafeAreaProvider>
  );
}
