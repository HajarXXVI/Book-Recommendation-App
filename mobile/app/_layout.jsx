import SafeScreen from "../components/SafeScreen";
import { Stack, useRouter, useSegments, useRootNavigationState, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";


//prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

//(tabs) and (auth) layouts will be rendered inside this root layout, which provides safe area handling and a status bar
export default function RootLayout() {

  //handle the automatic navigation between (tabs) and (auth) based on authentication state in a higher-level component or context (not shown here)
  const router = useRouter(); //this is used to navigate programmatically
  const segments = useSegments(); //this si sused to get the current route segments, segment is a part of the URL path, for example, in /(tabs)/profile, (tabs) and profile are segments
  //difference between useRouter and useSegments is that useRouter is used to navigate programmatically, while useSegments is used to get the current route segments for conditional rendering or logic based on the current route
  //🔺by using useSegement we can decide the user is in which route
  const rootNavigationState = useRootNavigationState();

  // console.log("Current segments:", segments);

  const { checkAuth, user, token, isCheckingAuth } = useAuthStore(); //get the checkAuth method, user and token state from the auth store

  //load custom fonts
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"), //it is used in signUp styles too
  });

  //hide the splash screen when the app loads (splashScreen is the screen that is shown while the app is loading)
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  //this is used to check authentication status when the app loads
  useEffect(() => {
    checkAuth(); //this will check if the user is authenticated by looking for user and token in async storage when the app loads and update the auth store state accordingly
  }, []);


  //this is used to automatically navigate between (tabs) and (auth) based on the authentication state
  useEffect(() => {
    if (!rootNavigationState?.key) return; // Wait for navigation to be ready
    if (isCheckingAuth) return; // Don't navigate while checking auth

    const inAuthScreen = segments[0] === "(auth)"; //check if the first segment is (auth)
    const isSignedIn = user && token; //check if user and token are present in the auth store

    if (!isSignedIn && !inAuthScreen) {
      //if user is not signed in and not already in (auth), navigate to (auth)
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      //if user is signed in and currently in (auth), navigate to (tabs)
      router.replace("/(tabs)");
    }
  }, [user, token, segments, isCheckingAuth, rootNavigationState?.key]);

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
