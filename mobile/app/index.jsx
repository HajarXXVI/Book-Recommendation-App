import { Link } from "expo-router";
import {StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "../store/authStore.js";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";


export default function Index() {
  const {user, token, checkAuth, logout} = useAuthStore();  
  
  console.log(user, token);

  // Check authentication status on component mount, this is used to keep user logged in between app restarts, it renders before the UI each time the app is started once the authStore is set up
  useEffect(() => {
    checkAuth()
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {user?.username}</Text>
      <Text style={styles.title}>Token: {token}</Text>

      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>

      <Link href="/(auth)/signup">Sign Up</Link>
      <Link href="/(auth)">Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "blue" },
})
