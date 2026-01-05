import { HeaderShownContext } from "@react-navigation/elements";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="index" options={{ title: "Home" }} />
    </Stack>
  );
}
