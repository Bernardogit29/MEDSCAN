import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider, useAppTheme } from "./src/context/ThemeContext";

function ThemedApp() {
  const { isDark } = useAppTheme();
  return <><StatusBar style={isDark ? "light" : "dark"} /><AppNavigator /></>;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider><AuthProvider><ThemedApp /></AuthProvider></ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
